
package com.careflow.service;

import com.careflow.model.Patient;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class HospitalService {

    private final List<Patient> patients = new ArrayList<>();

    private int nextPatientId = 1;

    // Register a patient
    public synchronized Patient registerPatient(Patient patient) {

        if (patient == null
                || patient.getName() == null
                || patient.getName().isBlank()
                || patient.getAge() < 0
                || patient.getAge() > 120) {

            throw new IllegalArgumentException(
                    "Please enter valid patient details."
            );
        }

        patient.setPatientId(nextPatientId++);

        if (patient.getPriority() == null
                || patient.getPriority().isBlank()) {

            patient.setPriority("REGULAR");
        }

        patient.setPriority(
                patient.getPriority().trim().toUpperCase()
        );

        if (patient.getDepartment() == null
                || patient.getDepartment().isBlank()) {

            patient.setDepartment("General Medicine");
        }

        if (patient.getStatus() == null
                || patient.getStatus().isBlank()) {

            patient.setStatus("WAITING");
        }

        patients.add(patient);

        return patient;
    }

    // Return all patient records
    public synchronized List<Patient> getAllPatients() {
        return new ArrayList<>(patients);
    }

    // Find a patient using ID
    public synchronized Patient findPatient(int patientId) {

        return patients.stream()
                .filter(patient ->
                        patient.getPatientId() == patientId)
                .findFirst()
                .orElse(null);
    }

    // Return regular patients currently waiting
    public synchronized List<Patient> getRegularQueue() {

        List<Patient> queue = new ArrayList<>();

        for (Patient patient : patients) {

            boolean regular =
                    !"EMERGENCY".equalsIgnoreCase(
                            patient.getPriority()
                    );

            boolean waiting =
                    !"SERVED".equalsIgnoreCase(
                            patient.getStatus()
                    );

            if (regular && waiting) {
                queue.add(patient);
            }
        }

        return queue;
    }

    // Return emergency patients currently waiting
    public synchronized List<Patient> getEmergencyQueue() {

        List<Patient> queue = new ArrayList<>();

        for (Patient patient : patients) {

            boolean emergency =
                    "EMERGENCY".equalsIgnoreCase(
                            patient.getPriority()
                    );

            boolean waiting =
                    !"SERVED".equalsIgnoreCase(
                            patient.getStatus()
                    );

            if (emergency && waiting) {
                queue.add(patient);
            }
        }

        // Higher-priority numbers are not assumed to mean
        // greater urgency. Emergency patients are called FIFO.
        return queue;
    }

    // Total registered patients
    public synchronized int getTotalPatients() {
        return patients.size();
    }

    // Regular queue size
    public synchronized int getRegularQueueSize() {
        return getRegularQueue().size();
    }

    // Emergency queue size
    public synchronized int getEmergencyQueueSize() {
        return getEmergencyQueue().size();
    }

    // Call the next regular patient
    public synchronized Patient callNextRegularPatient() {

        List<Patient> queue = getRegularQueue();

        if (queue.isEmpty()) {
            return null;
        }

        Patient patient = queue.get(0);
        patient.setStatus("SERVED");

        return patient;
    }

    // Call the next emergency patient
    public synchronized Patient callNextEmergencyPatient() {

        List<Patient> queue = getEmergencyQueue();

        if (queue.isEmpty()) {
            return null;
        }

        Patient patient = queue.get(0);
        patient.setStatus("SERVED");

        return patient;
    }

    // Update patient information
    public synchronized Patient updatePatient(
            int patientId,
            Patient updatedPatient) {

        Optional<Patient> result = patients.stream()
                .filter(patient ->
                        patient.getPatientId() == patientId)
                .findFirst();

        if (result.isEmpty()) {
            return null;
        }

        Patient existing = result.get();

        if (updatedPatient.getName() == null
                || updatedPatient.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Patient name cannot be empty."
            );
        }

        if (updatedPatient.getAge() < 0
                || updatedPatient.getAge() > 120) {

            throw new IllegalArgumentException(
                    "Invalid patient age."
            );
        }

        existing.setName(updatedPatient.getName());
        existing.setAge(updatedPatient.getAge());
        existing.setGender(updatedPatient.getGender());
        existing.setPhone(updatedPatient.getPhone());
        existing.setBloodGroup(updatedPatient.getBloodGroup());
        existing.setAddress(updatedPatient.getAddress());
        existing.setSymptoms(updatedPatient.getSymptoms());
        existing.setDepartment(updatedPatient.getDepartment());
        existing.setPriority(
                updatedPatient.getPriority() == null
                        ? "REGULAR"
                        : updatedPatient.getPriority()
                                .trim().toUpperCase()
        );

        // Preserve the existing patient's ID and status.
        return existing;
    }
}
