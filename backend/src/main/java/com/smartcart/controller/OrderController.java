package com.smartcart.controller;

import com.smartcart.dto.OrderDTO;
import com.smartcart.entity.Order;
import com.smartcart.entity.User;
import com.smartcart.service.InvoiceService;
import com.smartcart.service.OrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    public OrderController(OrderService orderService, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.invoiceService = invoiceService;
    }

    @PostMapping("/place")
    public ResponseEntity<OrderDTO> placeOrder(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, String> request) {
        String address = request != null ? request.get("shippingAddress") : null;
        return ResponseEntity.ok(orderService.placeOrder(user, address));
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<OrderDTO> confirmPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.confirmPayment(orderId, user));
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, user));
    }

    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        // Verify ownership
        orderService.getOrderById(orderId, user);

        Order order = orderService.getOrderEntity(orderId);
        byte[] pdfBytes = invoiceService.generateInvoicePdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + order.getOrderNumber() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
