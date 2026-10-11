package com.smartstock.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequest {

    @NotEmpty(message = "Sale items cannot be empty")
    @Valid
    private List<SaleItemRequest> items;

    @DecimalMin(value = "0.00", inclusive = true, message = "Discount cannot be negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", inclusive = true, message = "Tax cannot be negative")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;
}
