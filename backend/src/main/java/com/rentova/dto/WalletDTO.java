package com.rentova.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WalletDTO {
    private String id;
    private BigDecimal balance;
    private List<TransactionDTO> recentTransactions;
}
