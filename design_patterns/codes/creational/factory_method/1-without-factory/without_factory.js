class Vehicle{
    printVehicle(){
        throw new Error(`${this.printVehicle.name} must be implemented`);
    }
}

class TwoWheeler extends Vehicle{
    printVehicle(){
        console.debug("TWO WHEELER");
    }
}

class FourWheeler extends Vehicle{
    printVehicle(){
        console.debug("TWO WHEELER");
    }
}

class Client{
    constructor(type){
        switch(type){
            case 1:
                this.pVehicle=new TwoWheeler();
                break;
            case 2:
                this.pVehicle=new FourWheeler()
                break;
            default:
                this.pVehicle=null;
        }
    }

    cleanUp(){
        if(this.pVehicle!==null){
            this.pVehicle=null;
        }
    }

    getVehicle(){
        return this.pVehicle;
    }
}

function main(){
    const pClient=new Client(1);
    const pVehicle=pClient.getVehicle();
    if(pVehicle!==null){
        pVehicle.printVehicle();
    }
    pClient.cleanUp();
}

main();