package factory_method_java.concrete_products;
import factory_method_java.abstract_product.Vehicle;

// concrete products
public class FourWheeler extends Vehicle{
    @Override
    public void printVehicle(){
        System.out.println("4 WHEELER");
    }
}