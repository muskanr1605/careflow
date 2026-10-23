
package com.careflow.controller;

import com.careflow.model.Patient;
import com.careflow.service.HospitalService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final HospitalService hospitalService;

    public PatientController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    // Register a patient
    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(
            @RequestBody Patient patient) {

        try {
            Patient registered =
                    hospitalService.registerPatient(patient);

            return ResponseEntity.ok(registered);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Get all patients
    @GetMapping("/all")
    public ResponseEntity<?> getAllPatients() {

        return ResponseEntity.ok(
                hospitalService.getAllPatients()
        );
    }

    // Get a patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPatient(
            @PathVariable int id) {

        Patient patient =
                hospitalService.findPatient(id);

        if (patient == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(patient);
    }

    // Get regular queue
    @GetMapping("/queue/regular")
    public ResponseEntity<?> getRegularQueue() {

        return ResponseEntity.ok(
                hospitalService.getRegularQueue()
        );
    }

    // Get emergency queue
    @GetMapping("/queue/emergency")
    public ResponseEntity<?> getEmergencyQueue() {

        return ResponseEntity.ok(
                hospitalService.getEmergencyQueue()
        );
    }

    // Call next regular patient
    @PostMapping("/call/regular")
    public ResponseEntity<?> callNextRegularPatient() {

        Patient patient =
                hospitalService.callNextRegularPatient();

        if (patient == null) {
            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "No patients in the regular queue."
                    )
            );
        }

        return ResponseEntity.ok(patient);
    }

    // Call next emergency patient
    @PostMapping("/call/emergency")
    public ResponseEntity<?> callNextEmergencyPatient() {

        Patient patient =
                hospitalService.callNextEmergencyPatient();

        if (patient == null) {
            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "No patients in the emergency queue."
                    )
            );
        }

        return ResponseEntity.ok(patient);
    }

    // Update an existing patient
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(
            @PathVariable int id,
            @RequestBody Patient updatedPatient) {

        try {
            Patient patient =
                    hospitalService.updatePatient(
                            id,
                            updatedPatient
                    );

            if (patient == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(patient);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}
