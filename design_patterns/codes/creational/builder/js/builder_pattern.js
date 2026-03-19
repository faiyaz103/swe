// Product
class Computer{
    constructor(){
        this.cpu_=null;
        this.ram_=null;
        this.storage_=null;
    }

    setCpu(cpu){
        this.cpu_=cpu;
    }

    setRam(ram){
        this.ram_=ram;
    }

    setStorage(storage){
        this.storage_=storage;
    }

    displayInfo(){
        console.log(
            `
            Computer Config:\n
            CPU: ${this.cpu_}\n
            RAM: ${this.ram_}\n
            Storage: ${this.storage_}\n\n
            `
        );
    }
}

// abstract builder
class ComputerBuilder{
    buildCpu(){
        throw new Error("Method not implemented");
    }

    buildRam(){
        throw new Error("Method not implemented");
    }

    buildStorage(){
        throw new Error("Method not implemented");
    }
    
    getResult(){
        throw new Error("Method not implemented");
    }
}

// concrete builder
class GamingComputerBuilder extends ComputerBuilder{
    constructor(){
        super();
        this.computer=new Computer;
    };

    buildCpu(){
        this.computer.setCpu("Gaming CPU");
    }

    buildRam(){
        this.computer.setRam("16 GB DDR4");
    }

    buildStorage(){
        this.computer.setStorage("1TB Storage");
    }

    getResult(){
        return this.computer;
    }
}

// Director
class ComputerDirector{
    construct(builder){
        builder.buildCpu();
        builder.buildRam();
        builder.buildStorage();
    }
}

// client
function main(){
    const gamingBuilder=new GamingComputerBuilder();
    const director=new ComputerDirector;
    director.construct(gamingBuilder);

    const gamingComputer=gamingBuilder.getResult();
    gamingComputer.displayInfo();
}

main();
