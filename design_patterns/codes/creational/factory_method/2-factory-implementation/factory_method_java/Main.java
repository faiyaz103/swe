package factory_method_java;

import factory_method_java.abstract_product.Vehicle;
import factory_method_java.concrete_factories.FourWheelerFactory;
import factory_method_java.concrete_factories.TwoWheelerFactory;
import factory_method_java.factory_interface.VehicleFactory;

public class Main {
   public static void main(String[] args) {
    VehicleFactory twoWheelerFactory=new TwoWheelerFactory();
    Client twoWheelerClient=new Client(twoWheelerFactory);
    Vehicle twoWheeler=twoWheelerClient.getvehicle();
    twoWheeler.printVehicle();

    VehicleFactory fourWheelerFactory=new FourWheelerFactory();
    Client fourWheelerClient=new Client(fourWheelerFactory);
    Vehicle fourWheeler=fourWheelerClient.getvehicle();
    fourWheeler.printVehicle();
   }
}
