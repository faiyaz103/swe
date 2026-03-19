package design_patterns.codes.creational.builder.builder_java.product;

public class Computer {
    private String cpu_;
    private String ram_;
    private String storage_;

    public void setCpu(String cpu){
        cpu_=cpu;
    }

    public void setRam(String ram){
        ram_=ram;
    }

    public void setStorage(String storage){
        storage_=storage;
    }

    public void displayInfo(){
        System.out.println("Computer Config: "
            +"\nCPU: "+cpu_
            +"\nRAM: "+ram_
            +"\nStorage: "+storage_
            +"\n\n"
        );
    }
}
