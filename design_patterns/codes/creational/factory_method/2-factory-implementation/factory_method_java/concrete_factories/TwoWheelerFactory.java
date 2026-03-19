package factory_method_java.concrete_factories;

import factory_method_java.abstract_product.Vehicle;
import factory_method_java.concrete_products.TwoWheeler;
import factory_method_java.factory_interface.VehicleFactory;

public class TwoWheelerFactory implements VehicleFactory {
    public Vehicle createVehicle(){
        return new TwoWheeler();
    }
}
