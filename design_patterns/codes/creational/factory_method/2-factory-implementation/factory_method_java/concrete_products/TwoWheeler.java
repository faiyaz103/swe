package factory_method_java.concrete_products;
import factory_method_java.abstract_product.Vehicle;

// concrete products
public class TwoWheeler extends Vehicle{
    @Override
    public void printVehicle(){
        System.out.println("2 WHEELER");
    }
}
