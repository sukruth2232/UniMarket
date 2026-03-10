package com.unimarket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String notes;
}
