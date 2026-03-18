/*
Consider a software application that needs to handle the creation of various types of vehicles, such as Two Wheelers, Three Wheelers and Four Wheelers. Each type of vehicle has its own specific properties and behaviors.
*/
#include<bits/stdc++.h>
using namespace std;

class Vehicle{
    public:
    // Pure virtual function
    virtual void printVehicle()=0;
};

class TwoWheeler: public Vehicle{
    public:
    void printVehicle() override{
        cout<<"TWO WHEELER"<<endl;
    }
};

class FourWheeler: public Vehicle{
    public:
    void printVehicle() override {
        cout<<"FOUR WHEELER"<<endl;
    }
};

// Client/user class
class Client{
    private:
    Vehicle* pVehicle;

    public:
    Client(int type){
        switch (type)
        {
        case 1:
            /* code */
            pVehicle=new TwoWheeler();
            break;
        case 2:
            pVehicle=new FourWheeler();
        
        default:
            pVehicle=nullptr;
        }       
    }

    void cleanUp(){
        if(pVehicle!=nullptr){
            delete pVehicle;
            pVehicle=nullptr;
        }
    }

    Vehicle* getVehicle(){
        return pVehicle;
    }
};

// Driver code
int main(){
    Client pClient(1);
    Vehicle* pVehicle=pClient.getVehicle();

    if(pVehicle!=nullptr){
        pVehicle->printVehicle();
    }
    pClient.cleanUp();

    return 0;
}
/*
Issues with the Current Design
Tight coupling: Client depends directly on product classes.
Violation of SRP: Client handles both product creation and usage.
Hard to extend: Adding a new vehicle requires modifying the client.
*/

