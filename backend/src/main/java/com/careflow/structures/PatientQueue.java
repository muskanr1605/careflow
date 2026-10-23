package com.careflow.structures;

import com.careflow.model.Patient;

public class PatientQueue {

    private static class Node {
        Patient patient;
        Node next;

        Node(Patient patient) {
            this.patient = patient;
            this.next = null;
        }
    }

    private Node front;
    private Node rear;
    private int size;

    public PatientQueue() {
        front = null;
        rear = null;
        size = 0;
    }

    // Add a patient to the rear of the queue
    public boolean enqueue(Patient patient) {

        if (patient == null) {
            System.out.println("Invalid patient record.");
            return false;
        }

        Node newNode = new Node(patient);

        if (rear == null) {
            front = newNode;
            rear = newNode;
        } else {
            rear.next = newNode;
            rear = newNode;
        }

        size++;

        System.out.println(
            patient.getName() + " added to the regular queue."
        );

        return true;
    }

    // Call and remove the next patient
    public Patient dequeue() {

        if (front == null) {
            System.out.println("No patients waiting in the queue.");
            return null;
        }

        Patient nextPatient = front.patient;

        front = front.next;
        size--;

        if (front == null) {
            rear = null;
        }

        System.out.println(
            "Now calling patient: " + nextPatient.getName()
        );

        return nextPatient;
    }

    // Display all patients waiting
    public void displayQueue() {

        if (front == null) {
            System.out.println("The regular queue is empty.");
            return;
        }

        Node current = front;

        System.out.println("\n===== REGULAR PATIENT QUEUE =====");

        int position = 1;

        while (current != null) {

            System.out.println(
                position + ". Patient ID: "
                + current.patient.getPatientId()
                + " | Name: "
                + current.patient.getName()
            );

            current = current.next;
            position++;
        }
    }

    // View the next patient without removing them
    public Patient peek() {

        if (front == null) {
            return null;
        }

        return front.patient;
    }

    public boolean isEmpty() {
        return front == null;
    }

    public int getSize() {
        return size;
    }
}
