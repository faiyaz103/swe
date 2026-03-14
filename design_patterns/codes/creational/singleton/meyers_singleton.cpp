#include<bits/stdc++.h>
using namespace std;

class Database{
    private:
    Database(){
        cout<<"_____Database Connection_____"<<endl;
    }

    // STEP:A (CRITICAL) You must delete the copy constructor and assignment operator
    // so no one can accidentally copy your returned reference!
    Database(const Database&)=delete;
    void operator=(const Database&) = delete;

    public:
    static Database& getInstance(){
        static Database instance;
        return instance;
    }
};

void threadTask(){
    Database& db = Database::getInstance();
}

int main(){
    thread t1(threadTask);
    thread t2(threadTask);

    t1.join();
    t2.join();

    return 0;
}