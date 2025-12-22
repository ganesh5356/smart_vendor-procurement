package com.example.svmps.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class VendorDto {

    private Long id;

    @NotBlank(message = "Vendor name is required")
    @Size(min = 3, max = 100, message = "Vendor name must be between 3 to 100 characters")
    private String name;

    @NotBlank(message = "Contact name is required")
    @Size(min =3, max = 100, message = "Contact name can be b/w 3 to 100 characters")
    private String contactName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /*  Phone number validation
       - Exactly 10 digits
       - Indian format (no letters/special chars)
    */
    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phone;

    /*  Address validation
       - Minimum 3 characters
       - Prevents empty/short address
    */
    @NotBlank(message = "Address is required")
    @Size(min = 3, max = 255, message = "Address must be between 3 and 255 characters")
    private String address;

    /*  GST Number validation (India)
       Format: 15 characters
       Example: 29ABCDE1234F1Z5
    */
    @NotBlank(message = "GST number is required")
    @Pattern(
        regexp = "^[0-9]{2}[A-Z]{5}[0-9]{2}$",
        message = "Invalid GST number format"
    )
    private String gstNumber;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
