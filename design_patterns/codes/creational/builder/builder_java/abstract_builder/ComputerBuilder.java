package design_patterns.codes.creational.builder.builder_java.abstract_builder;

import design_patterns.codes.creational.builder.builder_java.product.Computer;

public interface ComputerBuilder {
    void buildCpu();
    void buildRam();
    void buildStorage();

    Computer getResult();
}

