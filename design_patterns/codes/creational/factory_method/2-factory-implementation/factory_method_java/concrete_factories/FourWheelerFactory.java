package factory_method_java.concrete_factories;

import factory_method_java.abstract_product.Vehicle;
import factory_method_java.concrete_products.FourWheeler;
import factory_method_java.factory_interface.VehicleFactory;

public class FourWheelerFactory implements VehicleFactory {
    public Vehicle createVehicle(){
        return new FourWheeler();
    }
}
