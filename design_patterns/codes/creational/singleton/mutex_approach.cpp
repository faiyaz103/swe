#include<bits/stdc++.h>
using namespace std;

class Database{
    private:
    static Database* instance;
    static mutex mtx; //the lock

    Database(){
        cout<<"Database Connected"<<endl;
    }

    public:
    static Database* getInstance(){
        // CHECK 1: Only bother trying to lock the door if the instance doesn't exist yet.
        // Once the object is created, all future calls will skip this and be blazing fast.
        if(instance==nullptr){

            // LOCK THE DOOR: Only one thread can step past this line at a time.
            lock_guard<mutex> lock(mtx);

            // CHECK 2: Once we get inside, check AGAIN. 
            // Why? Because Thread B might have been waiting right outside the door 
            // while Thread A was inside creating the object!
            if(instance==nullptr){
                instance = new Database();
            }
        }

        return instance;
    }
};

// Initialize static variablse
Database* Database::instance = nullptr;
mutex Database::mtx;

void threadTask(){
    Database* db = Database::getInstance();
}

int main(){

    thread t1(threadTask);
    thread t2(threadTask);

    t1.join();
    t2.join();

    return 0;
}