package com.careflow.structures;

import com.careflow.model.Patient;

public class PatientLinkedList {

    // Node represents one patient in the linked list
    private static class Node {
        Patient patient;
        Node next;

        Node(Patient patient) {
            this.patient = patient;
            this.next = null;
        }
    }

    private Node head;
    private int size;

    // Constructor
    public PatientLinkedList() {
        head = null;
        size = 0;
    }

    // Add a new patient
    public boolean addPatient(Patient patient) {

        if (patient == null) {
            System.out.println("Invalid patient record.");
            return false;
        }

        if (searchPatient(patient.getPatientId()) != null) {
            System.out.println("Patient ID already exists.");
            return false;
        }

        Node newNode = new Node(patient);

        if (head == null) {
            head = newNode;
        } else {
            Node current = head;

            while (current.next != null) {
                current = current.next;
            }

            current.next = newNode;
        }

        size++;

        System.out.println("Patient registered successfully!");
        return true;
    }

    // Search for a patient using Patient ID
    public Patient searchPatient(int patientId) {

        Node current = head;

        while (current != null) {

            if (current.patient.getPatientId() == patientId) {
                return current.patient;
            }

            current = current.next;
        }

        return null;
    }

    // Delete a patient using Patient ID
    public boolean deletePatient(int patientId) {

        if (head == null) {
            System.out.println("No patient records available.");
            return false;
        }

        // If the first node contains the patient
        if (head.patient.getPatientId() == patientId) {
            head = head.next;
            size--;

            System.out.println("Patient record deleted successfully!");
            return true;
        }

        Node current = head;

        while (current.next != null) {

            if (current.next.patient.getPatientId() == patientId) {

                current.next = current.next.next;
                size--;

                System.out.println("Patient record deleted successfully!");
                return true;
            }

            current = current.next;
        }

        System.out.println("Patient not found.");
        return false;
    }

    // Display all patient records
    public void displayAllPatients() {

        if (head == null) {
            System.out.println("No patient records available.");
            return;
        }

        Node current = head;

        System.out.println("\n===== PATIENT RECORDS =====");

        while (current != null) {

            current.patient.displayPatient();

            System.out.println("---------------------------");

            current = current.next;
        }
    }

    // Return the number of patients
    public int getSize() {
        return size;
    }

    // Check whether the list is empty
    public boolean isEmpty() {
        return head == null;
    }
}