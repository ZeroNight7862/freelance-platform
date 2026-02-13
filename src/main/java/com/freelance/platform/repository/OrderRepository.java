package com.freelance.platform.repository;

import com.freelance.platform.entity.Order;
import com.freelance.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByFreelancer(User freelancer);
    
    List<Order> findByClient(User client);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByFreelancerAndStatus(User freelancer, Order.OrderStatus status);
    
    List<Order> findByClientAndStatus(User client, Order.OrderStatus status);
}
