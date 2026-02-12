package com.freelance.platform.service;

import com.freelance.platform.dto.OrderDTO;
import com.freelance.platform.entity.Order;
import com.freelance.platform.entity.Project;
import com.freelance.platform.entity.User;
import com.freelance.platform.exception.BadRequestException;
import com.freelance.platform.exception.InsufficientFundsException;
import com.freelance.platform.exception.ResourceNotFoundException;
import com.freelance.platform.exception.UnauthorizedException;
import com.freelance.platform.repository.OrderRepository;
import com.freelance.platform.repository.ProjectRepository;
import com.freelance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<OrderDTO.OrderListResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public List<OrderDTO.OrderListResponse> getCurrentUserOrders() {
        User currentUser = userService.getCurrentUser();
        
        if (currentUser.getRole().equals(User.UserRole.FREELANCER)) {
            return orderRepository.findByFreelancer(currentUser).stream()
                    .map(this::mapToListResponse)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().equals(User.UserRole.CLIENT)) {
            return orderRepository.findByClient(currentUser).stream()
                    .map(this::mapToListResponse)
                    .collect(Collectors.toList());
        }
        
        return List.of();
    }

    public OrderDTO.OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        User currentUser = userService.getCurrentUser();
        
        if (!order.getFreelancer().getId().equals(currentUser.getId()) &&
            !order.getClient().getId().equals(currentUser.getId()) &&
            !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new UnauthorizedException("You don't have permission to view this order");
        }
        
        return mapToDetailResponse(order);
    }

    @Transactional
    public OrderDTO.OrderResponse createOrder(OrderDTO.CreateOrderRequest request) {
        User currentUser = userService.getCurrentUser();

        if (!currentUser.getRole().equals(User.UserRole.CLIENT)) {
            throw new UnauthorizedException("Only clients can create orders");
        }

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));

        if (!project.getClient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only create orders for your own projects");
        }

        User freelancer = userRepository.findById(request.freelancerId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found with id: " + request.freelancerId()));

        if (!freelancer.getRole().equals(User.UserRole.FREELANCER)) {
            throw new BadRequestException("Selected user is not a freelancer");
        }

        if (currentUser.getBalance().compareTo(request.price()) < 0) {
            throw new InsufficientFundsException("Insufficient balance to create order. Required: " + request.price() + ", Available: " + currentUser.getBalance());
        }

        Order order = new Order();
        order.setProject(project);
        order.setFreelancer(freelancer);
        order.setClient(currentUser);
        order.setPrice(request.price());
        order.setStatus(Order.OrderStatus.PENDING);

        currentUser.setBalance(currentUser.getBalance().subtract(request.price()));
        userRepository.save(currentUser);

        Order savedOrder = orderRepository.save(order);
        return mapToDetailResponse(savedOrder);
    }

    @Transactional
    public OrderDTO.OrderResponse updateOrderStatus(Long id, OrderDTO.UpdateOrderStatusRequest request) {
        User currentUser = userService.getCurrentUser();
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        boolean isClient = order.getClient().getId().equals(currentUser.getId());
        boolean isFreelancer = order.getFreelancer().getId().equals(currentUser.getId());

        if (!isClient && !isFreelancer && !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new UnauthorizedException("You don't have permission to update this order");
        }

        if (request.status().equals(Order.OrderStatus.ACCEPTED) && !isFreelancer) {
            throw new UnauthorizedException("Only the freelancer can accept the order");
        }

        if (request.status().equals(Order.OrderStatus.CANCELLED) && !isClient) {
            throw new UnauthorizedException("Only the client can cancel the order");
        }

        order.setStatus(request.status());

        Order updatedOrder = orderRepository.save(order);
        return mapToDetailResponse(updatedOrder);
    }

    @Transactional
    public OrderDTO.OrderResponse completeOrder(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!order.getClient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the client can complete the order");
        }

        if (!order.getStatus().equals(Order.OrderStatus.IN_PROGRESS)) {
            throw new BadRequestException("Order must be in progress to complete");
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        User freelancer = order.getFreelancer();
        freelancer.setBalance(freelancer.getBalance().add(order.getPrice()));
        userRepository.save(freelancer);

        Order completedOrder = orderRepository.save(order);
        return mapToDetailResponse(completedOrder);
    }

    @Transactional
    public void cancelOrder(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!order.getClient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the client can cancel the order");
        }

        if (order.getStatus().equals(Order.OrderStatus.COMPLETED)) {
            throw new BadRequestException("Cannot cancel completed order");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);

        User client = order.getClient();
        client.setBalance(client.getBalance().add(order.getPrice()));
        userRepository.save(client);

        orderRepository.save(order);
    }

    private OrderDTO.OrderResponse mapToDetailResponse(Order order) {
        return new OrderDTO.OrderResponse(
                order.getId(),
                order.getProject().getId(),
                order.getProject().getTitle(),
                order.getFreelancer().getId(),
                order.getFreelancer().getUsername(),
                order.getClient().getId(),
                order.getClient().getUsername(),
                order.getPrice().toString(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getCompletedAt()
        );
    }

    private OrderDTO.OrderListResponse mapToListResponse(Order order) {
        return new OrderDTO.OrderListResponse(
                order.getId(),
                order.getProject().getTitle(),
                order.getFreelancer().getUsername(),
                order.getClient().getUsername(),
                order.getPrice().toString(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
