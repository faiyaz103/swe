package factory_method_java;

import factory_method_java.abstract_product.Vehicle;
import factory_method_java.factory_interface.VehicleFactory;

public class Client {
    private Vehicle pVehicle;

    public Client(VehicleFactory factory){
        pVehicle=factory.createVehicle();
    }

    public Vehicle getvehicle(){
        return pVehicle;
    }
}
