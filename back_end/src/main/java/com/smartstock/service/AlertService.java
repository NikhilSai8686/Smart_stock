package com.smartstock.service;

import com.smartstock.dto.ExpiryAlertDto;
import com.smartstock.dto.LowStockAlertDto;

import java.util.List;

public interface AlertService {
    List<LowStockAlertDto> getLowStockAlerts();
    List<ExpiryAlertDto> getExpiryAlerts();
}
