package factory_method_java.abstract_product;
// abstract product
public abstract class Vehicle{
    // Constructor to prevent direct instantiation
    /*private Vehicle(){
        throw new UnsupportedOperationException("Can not construct vehicle instances directly");
    }*/
   // No private constructor needed! 
    // The 'abstract' keyword already prevents direct instantiation.
    
    // abstract method to be implemenred by subclasses(override)
    public abstract void printVehicle();
}