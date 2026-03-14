// This is the most basic implementation (NOT THREAD SAFE)
#include<bits/stdc++.h>
using namespace std;

class Database{
    private:
    static Database* instance;
    Database(){
        cout<<"Database instance instantiated"<<endl;;
    }

    public:
    static Database* getInstance(){
        if (instance==nullptr){
            instance = new Database();
        }

        return instance;
    }

    string query(string sql){
        return sql;
    }
};

// Initializ the static variable
Database* Database::instance=nullptr;


int main(){
    string result=Database::getInstance()->query("SELECT.....");
    cout<<result<<endl;

    return 0;
}