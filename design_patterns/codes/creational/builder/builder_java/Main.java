package design_patterns.codes.creational.builder.builder_java;

import design_patterns.codes.creational.builder.builder_java.concrete_builder.GamingComputerBuilder;
import design_patterns.codes.creational.builder.builder_java.director.ComputerDirector;
import design_patterns.codes.creational.builder.builder_java.product.Computer;

// Client
public class Main {
    public static void main(String[] args) {
        GamingComputerBuilder gamingBuilder=new GamingComputerBuilder();
        ComputerDirector director=new ComputerDirector();
        director.construct(gamingBuilder);

        Computer gamingComputer=gamingBuilder.getResult();
        gamingComputer.displayInfo();
    }    
}
