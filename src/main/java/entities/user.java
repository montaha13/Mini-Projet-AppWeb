package entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class user {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int getId(){return id;}
    private String username;
    public String setUsername(){ return username;}
    private String password;
    public String setPassword(){ return password;}
    private String email;
    public String setEmail(){ return email;};
    private String firstName;
    public String setFirstName(){ return firstName;}
    private String lastName;
    public String setLastName(){ return lastName;}
    private String phone;
    public String setPhone(){ return phone;}
    private String address;
    public String setAddress(){ return address;}
    private String poste;
    public String setPoste(){ return poste;}
    public user(){
        this.username=username;
        this.password=password;
        this.email=email;
        this.firstName=firstName;
        this.poste=poste;
        this.phone=phone;
        this.address=address;
    }
    }