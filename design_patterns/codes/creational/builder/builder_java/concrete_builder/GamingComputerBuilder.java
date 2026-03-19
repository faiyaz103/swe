package design_patterns.codes.creational.builder.builder_java.concrete_builder;

import design_patterns.codes.creational.builder.builder_java.abstract_builder.ComputerBuilder;
import design_patterns.codes.creational.builder.builder_java.product.Computer;

public class GamingComputerBuilder implements ComputerBuilder {
    private Computer computer=new Computer();

    @Override
    public void buildCpu() {
        computer.setCpu("Gaming CPU");    
    }
    @Override
    public void buildRam() {
        computer.setRam("16 GB DDR4");   
        
    }
    @Override
    public void buildStorage() {
        computer.setStorage("1TB SSD");
    }

    @Override
    public Computer getResult() {
        return computer;
    }
}
