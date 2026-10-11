package com.smartstock.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    private Long supplierId;

    @NotEmpty(message = "Purchase items cannot be empty")
    @Valid
    private List<PurchaseItemRequest> items;
}
