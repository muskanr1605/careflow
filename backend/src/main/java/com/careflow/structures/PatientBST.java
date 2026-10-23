
package com.careflow.structures;

import com.careflow.model.Patient;

public class PatientBST {

    private static class Node {
        Patient patient;
        Node left;
        Node right;

        Node(Patient patient) {
            this.patient = patient;
            left = null;
            right = null;
        }
    }

    private Node root;

    public PatientBST() {
        root = null;
    }

    // Insert a patient according to Patient ID
    public boolean insertPatient(Patient patient) {

        if (patient == null) {
            System.out.println("Invalid patient record.");
            return false;
        }

        if (searchPatient(patient.getPatientId()) != null) {
            System.out.println("Patient ID already exists in BST.");
            return false;
        }

        root = insertRecursive(root, patient);

        System.out.println(
            "Patient added to BST: " + patient.getPatientId()
        );

        return true;
    }

    private Node insertRecursive(Node current, Patient patient) {

        if (current == null) {
            return new Node(patient);
        }

        if (patient.getPatientId() < current.patient.getPatientId()) {
            current.left = insertRecursive(current.left, patient);
        } else if (patient.getPatientId() > current.patient.getPatientId()) {
            current.right = insertRecursive(current.right, patient);
        }

        return current;
    }

    // Search for a patient using Patient ID
    public Patient searchPatient(int patientId) {

        Node current = root;

        while (current != null) {

            int currentId = current.patient.getPatientId();

            if (patientId == currentId) {
                return current.patient;
            }

            if (patientId < currentId) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    // Delete a patient using Patient ID
    public boolean deletePatient(int patientId) {

        if (searchPatient(patientId) == null) {
            System.out.println("Patient not found in BST.");
            return false;
        }

        root = deleteRecursive(root, patientId);

        System.out.println(
            "Patient removed from BST: " + patientId
        );

        return true;
    }

    private Node deleteRecursive(Node current, int patientId) {

        if (current == null) {
            return null;
        }

        if (patientId < current.patient.getPatientId()) {

            current.left = deleteRecursive(current.left, patientId);

        } else if (patientId > current.patient.getPatientId()) {

            current.right = deleteRecursive(current.right, patientId);

        } else {

            // Case 1: No child
            if (current.left == null && current.right == null) {
                return null;
            }

            // Case 2: One child
            if (current.left == null) {
                return current.right;
            }

            if (current.right == null) {
                return current.left;
            }

            // Case 3: Two children
            Node successor = findMinimum(current.right);

            current.patient = successor.patient;

            current.right = deleteRecursive(
                current.right,
                successor.patient.getPatientId()
            );
        }

        return current;
    }

    // Find the smallest ID in a subtree
    private Node findMinimum(Node current) {

        while (current.left != null) {
            current = current.left;
        }

        return current;
    }

    // Display patient IDs in ascending order
    public void displaySortedPatients() {

        if (root == null) {
            System.out.println("No patients available in BST.");
            return;
        }

        System.out.println("\n===== PATIENT IDS IN SORTED ORDER =====");

        inorderTraversal(root);

        System.out.println();
    }

    private void inorderTraversal(Node current) {

        if (current != null) {

            inorderTraversal(current.left);

            System.out.print(
                current.patient.getPatientId() + " "
            );

            inorderTraversal(current.right);
        }
    }

    public boolean isEmpty() {
        return root == null;
    }
}
