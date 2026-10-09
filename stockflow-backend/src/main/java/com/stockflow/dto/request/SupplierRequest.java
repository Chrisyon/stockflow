package com.stockflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {

    @NotBlank(message = "Nama supplier tidak boleh kosong")
    private String name;

    private String contactPerson;
    private String phone;
    private String email;
    private String address;
}
