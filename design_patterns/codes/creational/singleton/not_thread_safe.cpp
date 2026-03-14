// Thread Unsafe Example

/*When you use "Lazy Initialization," you wait to create the Singleton object until 
the exact moment someone asks for it. In a single-threaded program, this works 
perfectly. But in a multi-threaded environment, it creates a dangerous Race Condition.*/

#include<bits/stdc++.h>
#include<thread>
#include<chrono>
using namespace std;

class Database{
    private:
    static Database* instance;
    Database(){
        cout<<"_____Database Connected_____"<<endl;
    }

    public:
    static Database* getInstance(){

        // THE DANGER ZONE
        if(instance==nullptr){

            // Simulate a tiny delay before actual creation
            this_thread::sleep_for(chrono::microseconds(50));

            instance = new Database();
        }

        return instance;
    }
};

// Initialize static variable to null
Database* Database::instance=nullptr;

// A function for our threads to run
void threadTask(){
    Database* db = Database::getInstance();
}

int main(){

    cout<<"Starting threads"<<endl;

    // Spawn 2 threads at the exact same time
    thread t1(threadTask);
    thread t2(threadTask);

    // wait for both threads to finish
    t1.join();
    t2.join();

    return 0;
}