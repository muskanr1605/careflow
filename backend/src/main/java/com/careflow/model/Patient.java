
package com.careflow.model;

public class Patient {

    private int patientId;
    private String name;
    private int age;
    private String gender;
    private String phone;
    private String bloodGroup;
    private String address;
    private String symptoms;
    private String department;
    private String priority;
    private String status;

    public Patient() {
    }

    public Patient(
            int patientId,
            String name,
            int age,
            String gender,
            String phone,
            String bloodGroup,
            String address,
            String symptoms,
            String department,
            String priority,
            String status) {

        this.patientId = patientId;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.bloodGroup = bloodGroup;
        this.address = address;
        this.symptoms = symptoms;
        this.department = department;
        this.priority = priority;
        this.status = status;
    }

    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void displayPatient() {
        System.out.println("Patient ID: " + patientId);
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Gender: " + gender);
        System.out.println("Phone: " + phone);
        System.out.println("Blood Group: " + bloodGroup);
        System.out.println("Address: " + address);
        System.out.println("Symptoms: " + symptoms);
        System.out.println("Department: " + department);
        System.out.println("Priority: " + priority);
        System.out.println("Status: " + status);
    }
}
