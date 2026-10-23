
package com.careflow.structures;

import com.careflow.model.Patient;

public class EmergencyPriorityQueue {

    private static class Node {
        Patient patient;
        Node next;

        Node(Patient patient) {
            this.patient = patient;
            this.next = null;
        }
    }

    private Node front;
    private int size;

    public EmergencyPriorityQueue() {
        front = null;
        size = 0;
    }

    // Convert priority into a numeric value.
    // Lower number means higher urgency.
    private int getPriorityValue(Patient patient) {
        String priority = patient.getPriority();

        if (priority == null) {
            return 3;
        }

        priority = priority.trim().toUpperCase();

        switch (priority) {
            case "EMERGENCY":
            case "URGENT":
            case "1":
                return 1;

            case "HIGH":
            case "2":
                return 2;

            case "REGULAR":
            case "MEDIUM":
            case "LOW":
            case "3":
                return 3;

            default:
                return 3;
        }
    }

    // Add patient according to emergency priority
    public boolean addEmergencyPatient(Patient patient) {

        if (patient == null) {
            System.out.println("Invalid patient record.");
            return false;
        }

        if (patient.getPriority() == null
                || patient.getPriority().trim().isEmpty()) {
            System.out.println("Patient priority is missing.");
            return false;
        }

        Node newNode = new Node(patient);
        int newPriority = getPriorityValue(patient);

        // Insert at the beginning if the queue is empty
        // or the new patient has a higher priority
        if (front == null
                || newPriority < getPriorityValue(front.patient)) {

            newNode.next = front;
            front = newNode;

        } else {

            Node current = front;

            // Preserve arrival order for patients with equal priority
            while (current.next != null
                    && getPriorityValue(current.next.patient) <= newPriority) {
                current = current.next;
            }

            newNode.next = current.next;
            current.next = newNode;
        }

        size++;

        System.out.println(
            "Emergency patient added: " + patient.getName()
        );

        return true;
    }

    // Call the highest-priority emergency patient
    public Patient callNextEmergencyPatient() {

        if (front == null) {
            System.out.println("No emergency patients waiting.");
            return null;
        }

        Patient patient = front.patient;
        front = front.next;
        size--;

        System.out.println(
            "Calling emergency patient: " + patient.getName()
            + " | Priority: " + patient.getPriority()
        );

        return patient;
    }

    // Display emergency queue
    public void displayEmergencyQueue() {

        if (front == null) {
            System.out.println("Emergency queue is empty.");
            return;
        }

        Node current = front;

        System.out.println("\n===== EMERGENCY QUEUE =====");

        while (current != null) {

            System.out.println(
                "Patient ID: " + current.patient.getPatientId()
                + " | Name: " + current.patient.getName()
                + " | Priority: " + current.patient.getPriority()
            );

            current = current.next;
        }
    }

    public boolean isEmpty() {
        return front == null;
    }

    public int getSize() {
        return size;
    }
}

