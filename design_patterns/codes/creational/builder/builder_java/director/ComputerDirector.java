package design_patterns.codes.creational.builder.builder_java.director;

import design_patterns.codes.creational.builder.builder_java.abstract_builder.ComputerBuilder;

public class ComputerDirector {
    public void construct(ComputerBuilder builder){
        builder.buildCpu();
        builder.buildRam();
        builder.buildStorage();
    }
}
