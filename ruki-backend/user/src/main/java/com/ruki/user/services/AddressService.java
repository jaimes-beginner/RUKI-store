package com.ruki.user.services;

import com.ruki.user.requests.AddressCreate;
import com.ruki.user.requests.AddressResponse;
import com.ruki.user.requests.AddressUpdate;
import java.util.List;

public interface AddressService {

    AddressResponse createAddress(AddressCreate addressCreate);
    List<AddressResponse> getActiveAddressesByUserId(Long userId); 
    List<AddressResponse> getAllAddresses();
    AddressResponse updateAddress(Long addressId, AddressUpdate addressUpdate);
    void deleteAddress(Long addressId);
    List<AddressResponse> getAddressesByUserId(Long userId);
    
}