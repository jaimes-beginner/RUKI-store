package com.ruki.user.services;

import com.ruki.user.requests.AddressCreate;
import com.ruki.user.requests.AddressResponse;
import com.ruki.user.requests.AddressUpdate;
import java.util.List;

public interface AddressService {

    /* 
        Aquí se indican los métodos que tendrán 
        si o si la lógica de las direcciónes, en este 
        caso tiene el de crear una dirección y el de 
        obtener la/s direccion/es de un usuario por su ID
    */

    AddressResponse createAddress(AddressCreate addressCreate);
    List<AddressResponse> getAddressesByUserId(Long userId);
    List<AddressResponse> getAllAddresses();
    AddressResponse updateAddress(Long addressId, AddressUpdate addressUpdate);
    void deleteAddress(Long addressId);
    
}