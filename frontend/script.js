
/* =====================================================
   CAREFLOW — HOSPITAL MANAGEMENT SYSTEM
   Patient Registration | Queue | Records | Dashboard
===================================================== */

const API_BASE = "http://localhost:8080/api/patients";

let allPatients = [];
let regularPatients = [];
let emergencyPatients = [];
let servedThisSession = 0;
let currentEditingPatient = null;
let toastTimer = null;

/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    displayCurrentDate();
    setupRegistrationForm();
    setupSearchForm();
    setupPatientUpdateHandler();
    loadDashboard();

    setInterval(() => {
        loadDashboard({ silent: true });
    }, 10000);
});

/* =====================================================
   DATE
===================================================== */

function displayCurrentDate() {
    const dateElement = document.getElementById("currentDate");

    if (!dateElement) return;

    dateElement.textContent = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* =====================================================
   API HELPERS
===================================================== */

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    const responseText = await response.text();

    if (!response.ok) {
        let message = responseText || `Request failed (${response.status})`;

        try {
            const errorData = JSON.parse(responseText);
            message =
                errorData.message ||
                errorData.error ||
                errorData.detail ||
                message;
        } catch {
            // Keep the original error text.
        }

        throw new Error(message);
    }

    if (response.status === 204 || !responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch {
        return responseText;
    }
}

function normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.patients)) return data.patients;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

function getPatientId(patient) {
    return (
        patient?.id ??
        patient?.patientId ??
        patient?.patient_id ??
        patient?.idNumber ??
        ""
    );
}

function getPatientName(patient) {
    return (
        patient?.name ??
        patient?.patientName ??
        patient?.fullName ??
        "Unknown Patient"
    );
}

function getPatientAge(patient) {
    return patient?.age ?? "—";
}

function getPatientGender(patient) {
    return patient?.gender ?? "—";
}

function getPatientDepartment(patient) {
    return (
        patient?.department ??
        patient?.departmentName ??
        patient?.specialization ??
        "General Medicine"
    );
}

function getPatientPriority(patient) {
    const value = String(
        patient?.priority ??
        patient?.type ??
        patient?.queueType ??
        patient?.status ??
        ""
    ).toUpperCase();

    if (value.includes("EMERGENCY") || value.includes("URGENT")) {
        return "EMERGENCY";
    }

    return "REGULAR";
}

function getPatientStatus(patient) {
    return String(
        patient?.status ??
        patient?.patientStatus ??
        patient?.queueStatus ??
        ""
    ).toUpperCase();
}

function isServed(patient) {
    return [
        "SERVED",
        "COMPLETED",
        "CONSULTED",
        "DONE",
        "DISCHARGED"
    ].includes(getPatientStatus(patient));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

/* =====================================================
   NAVIGATION
===================================================== */

function showPage(pageId, clickedButton = null) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        console.error("Page not found:", pageId);
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    targetPage.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.remove("active");
    });

    const matchingButton =
        clickedButton ||
        document.querySelector(`.nav-item[data-page="${pageId}"]`);

    if (matchingButton) {
        matchingButton.classList.add("active");
    }

    const breadcrumb = document.getElementById("breadcrumbTitle");

    if (breadcrumb) {
        const titles = {
            dashboard: "Dashboard",
            registration: "Patient Registration",
            queues: "Patient Queue",
            emergency: "Emergency Department",
            records: "Patient Records"
        };

        breadcrumb.textContent = titles[pageId] || "Dashboard";
    }

    if (pageId === "dashboard") {
        loadDashboard({ silent: true });
    }

    if (pageId === "queues") {
        renderRegularQueue();
        updateQueueCounts();
    }

    if (pageId === "emergency") {
        renderEmergencyQueue();
        updateQueueCounts();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =====================================================
   DASHBOARD DATA
===================================================== */

async function loadDashboard(options = {}) {
    const { silent = false } = options;

    try {
        const results = await Promise.all([
            apiRequest(`${API_BASE}/all`),
            apiRequest(`${API_BASE}/queue/regular`),
            apiRequest(`${API_BASE}/queue/emergency`)
        ]);

        allPatients = normalizeArray(results[0]);
        regularPatients = normalizeArray(results[1]);
        emergencyPatients = normalizeArray(results[2]);

        updateDashboardStatistics();
        renderRegularQueue();
        renderEmergencyQueue();
        updateQueueCounts();
        updateSearchResultIfNeeded();
    } catch (error) {
        console.error("Dashboard loading error:", error);

        if (!silent) {
            showToast(
                "Could not load hospital data. Check that the backend is running.",
                "error"
            );
        }
    }
}

/* =====================================================
   DASHBOARD STATISTICS
===================================================== */

function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function updateDashboardStatistics() {
    const total = allPatients.length;
    const regular = regularPatients.length;
    const emergency = emergencyPatients.length;

    const statusesAvailable = allPatients.some(patient => {
        return Boolean(getPatientStatus(patient));
    });

    const served = statusesAvailable
        ? allPatients.filter(isServed).length
        : Math.min(servedThisSession, total);

    setText("totalPatients", total);
    setText("regularCount", regular);
    setText("emergencyCount", emergency);
    setText("servedCount", served);
    setText("regularQueueTotal", regular);
    setText("emergencyQueueTotal", emergency);
    setText("queueRegularCount", regular);
    setText("queueEmergencyCount", emergency);
    setText("emergencyPageCount", emergency);
    setText("queueNavCount", regular + emergency);
}

/* =====================================================
   PATIENT REGISTRATION
===================================================== */

function setupRegistrationForm() {
    const form = document.getElementById("registrationForm");

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const formData = new FormData(form);

        const name = String(formData.get("name") || "").trim();
        const ageValue = String(formData.get("age") ?? "").trim();
        const age = Number(ageValue);
        const gender = String(formData.get("gender") || "").trim();
        const priority = String(
            formData.get("priority") || "REGULAR"
        ).trim().toUpperCase();

        if (!name) {
            showToast("Please enter the patient's name.", "error");
            return;
        }

        if (
            ageValue === "" ||
            !Number.isFinite(age) ||
            age < 0 ||
            age > 120
        ) {
            showToast("Please enter a valid patient age.", "error");
            return;
        }

        if (!gender) {
            showToast("Please select the patient's gender.", "error");
            return;
        }

        /*
          IMPORTANT:
          The backend may accept different field names.
          This payload includes the common Patient fields.
          If registration still returns HTTP 400, compare
          these fields with Patient.java and PatientController.java.
        */

        const patient = {
            name: name,
            age: age,
            gender: gender,
            phone: String(formData.get("phone") || "").trim(),
            bloodGroup: String(formData.get("bloodGroup") || "").trim(),
            address: String(formData.get("address") || "").trim(),
            department: String(
                formData.get("department") || "General Medicine"
            ).trim(),
            priority: priority,
            symptoms: String(formData.get("symptoms") || "").trim()
        };

        const submitButton = form.querySelector('button[type="submit"]');

        setButtonLoading(submitButton, true, "Registering...");

        try {
            const registeredPatient = await apiRequest(
                `${API_BASE}/register`,
                {
                    method: "POST",
                    body: JSON.stringify(patient)
                }
            );

            addActivity(
                "Patient Registered",
                `${name} has been registered successfully.`,
                "♙"
            );

            form.reset();

            showToast("Patient registered successfully!", "success");

            await loadDashboard({ silent: true });

            if (registeredPatient) {
                currentEditingPatient = registeredPatient;
            }
        } catch (error) {
            console.error("Registration error:", error);

            showToast(
                `Registration failed: ${error.message}`,
                "error"
            );
        } finally {
            setButtonLoading(submitButton, false);
        }
    });
}

/* =====================================================
   REGULAR QUEUE TABLE
===================================================== */

function renderRegularQueue() {
    const tableBody = document.getElementById("regularQueueTable");

    if (!tableBody) return;

    if (regularPatients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No patients currently in the regular queue.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = regularPatients.map(patient => `
        <tr>
            <td>
                <strong>${escapeHTML(getPatientId(patient) || "—")}</strong>
            </td>
            <td>${escapeHTML(getPatientName(patient))}</td>
            <td>${escapeHTML(getPatientAge(patient))}</td>
            <td>${escapeHTML(getPatientGender(patient))}</td>
            <td>${escapeHTML(getPatientDepartment(patient))}</td>
            <td>
                <span class="status-pill regular-pill">Waiting</span>
            </td>
        </tr>
    `).join("");
}

/* =====================================================
   EMERGENCY QUEUE TABLE
===================================================== */

function renderEmergencyQueue() {
    const tableBody = document.getElementById("emergencyQueueTable");

    if (!tableBody) return;

    if (emergencyPatients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No emergency patients currently waiting.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = emergencyPatients.map(patient => `
        <tr>
            <td>
                <strong>${escapeHTML(getPatientId(patient) || "—")}</strong>
            </td>
            <td>${escapeHTML(getPatientName(patient))}</td>
            <td>${escapeHTML(getPatientAge(patient))}</td>
            <td>${escapeHTML(getPatientGender(patient))}</td>
            <td>${escapeHTML(getPatientDepartment(patient))}</td>
            <td>
                <span class="status-pill emergency-pill">Priority</span>
            </td>
        </tr>
    `).join("");
}

/* =====================================================
   QUEUE COUNTS
===================================================== */

function updateQueueCounts() {
    setText("regularCount", regularPatients.length);
    setText("emergencyCount", emergencyPatients.length);
    setText("regularQueueTotal", regularPatients.length);
    setText("emergencyQueueTotal", emergencyPatients.length);
    setText("queueRegularCount", regularPatients.length);
    setText("queueEmergencyCount", emergencyPatients.length);
    setText("emergencyPageCount", emergencyPatients.length);

    setText(
        "queueNavCount",
        regularPatients.length + emergencyPatients.length
    );
}

/* =====================================================
   CALL REGULAR PATIENT
===================================================== */

async function callRegularPatient() {
    if (regularPatients.length === 0) {
        showToast(
            "No patients are waiting in the regular queue.",
            "warning"
        );
        return;
    }

    try {
        const result = await apiRequest(
            `${API_BASE}/call/regular`,
            { method: "POST" }
        );

        servedThisSession++;

        const patientName = getPatientName(result || regularPatients[0]);

        addActivity(
            "Regular Patient Called",
            `${patientName} has been called for consultation.`,
            "☷"
        );

        showToast(`${patientName} has been called.`, "success");

        await loadDashboard({ silent: true });
    } catch (error) {
        console.error("Regular queue error:", error);

        showToast(
            error.message || "Unable to call the next patient.",
            "error"
        );
    }
}

/* =====================================================
   CALL EMERGENCY PATIENT
===================================================== */

async function callEmergencyPatient() {
    if (emergencyPatients.length === 0) {
        showToast(
            "No emergency patients are waiting in the queue.",
            "warning"
        );
        return;
    }

    try {
        const result = await apiRequest(
            `${API_BASE}/call/emergency`,
            { method: "POST" }
        );

        servedThisSession++;

        const patientName = getPatientName(result || emergencyPatients[0]);

        addActivity(
            "Emergency Patient Called",
            `${patientName} has been called for emergency attention.`,
            "✚"
        );

        showToast(
            `Emergency patient ${patientName} has been called.`,
            "success"
        );

        await loadDashboard({ silent: true });
    } catch (error) {
        console.error("Emergency queue error:", error);

        showToast(
            error.message || "Unable to call the next patient.",
            "error"
        );
    }
}

/* =====================================================
   PATIENT SEARCH
===================================================== */

function setupSearchForm() {
    const form = document.getElementById("searchForm");

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const input = document.getElementById("searchPatientId");
        const patientId = input?.value.trim();

        if (!patientId) {
            showToast("Please enter a patient ID.", "warning");
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');

        setButtonLoading(submitButton, true, "Searching...");

        try {
            const patient = await apiRequest(
                `${API_BASE}/${encodeURIComponent(patientId)}`
            );

            if (!patient) {
                showToast("Patient record not found.", "warning");
                return;
            }

            renderPatientRecord(patient);
        } catch (error) {
            console.error("Patient search error:", error);

            showToast(
                "Patient not found or unable to retrieve the record.",
                "error"
            );
        } finally {
            setButtonLoading(submitButton, false);
        }
    });
}

/* =====================================================
   PATIENT RECORD
===================================================== */

function renderPatientRecord(patient) {
    const container = document.getElementById("searchResult");

    if (!container) return;

    const id = getPatientId(patient);
    const name = getPatientName(patient);

    container.innerHTML = `
        <div class="content-card patient-record-card">
            <div class="patient-record-header">
                <div class="patient-record-avatar">
                    ${escapeHTML(
                        name.split(/\s+/)
                            .map(part => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                    )}
                </div>

                <div>
                    <h3>${escapeHTML(name)}</h3>
                    <p>Patient ID: ${escapeHTML(id || "—")}</p>
                </div>

                <span class="status-pill regular-pill" style="margin-left:auto;">
                    Patient Record
                </span>
            </div>

            <div class="patient-record-grid">
                ${recordField("Full Name", name)}
                ${recordField("Patient ID", id || "—")}
                ${recordField("Age", getPatientAge(patient))}
                ${recordField("Gender", getPatientGender(patient))}
                ${recordField("Phone", patient.phone || patient.phoneNumber || "—")}
                ${recordField("Blood Group", patient.bloodGroup || "—")}
                ${recordField("Department", getPatientDepartment(patient))}
                ${recordField("Priority", getPatientPriority(patient))}
                ${recordField("Address", patient.address || "—")}
                ${recordField("Symptoms", patient.symptoms || "—")}
            </div>

            <div style="display:flex; justify-content:flex-end; margin-top:22px; gap:10px; flex-wrap:wrap;">
                <button
                    class="btn btn-primary"
                    type="button"
                    id="editPatientButton"
                >
                    Edit Patient Details
                </button>
            </div>
        </div>
    `;

    const editButton = document.getElementById("editPatientButton");

    if (editButton) {
        editButton.addEventListener("click", () => {
            renderPatientEditForm(patient);
        });
    }
}

function recordField(label, value) {
    return `
        <div class="patient-record-field">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

/* =====================================================
   EDIT PATIENT FORM
===================================================== */

function renderPatientEditForm(patient) {
    const container = document.getElementById("searchResult");

    if (!container) return;

    currentEditingPatient = patient;

    const departments = [
        "General Medicine",
        "Cardiology",
        "Orthopedics",
        "Pediatrics",
        "Neurology",
        "Dermatology",
        "Gynecology",
        "ENT",
        "Ophthalmology",
        "Other"
    ];

    const bloodGroups = [
        "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
    ];

    const selectedDepartment = getPatientDepartment(patient);
    const selectedBloodGroup = patient.bloodGroup || "";

    container.innerHTML = `
        <div class="content-card patient-record-card">
            <div class="card-heading">
                <div>
                    <h2>Update Patient Details</h2>
                    <p>Make the necessary changes and save the record.</p>
                </div>

                <span class="status-pill regular-pill">Edit Mode</span>
            </div>

            <form id="patientUpdateForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="editName">Full Name *</label>
                        <input
                            id="editName"
                            name="name"
                            value="${escapeHTML(getPatientName(patient))}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="editAge">Age *</label>
                        <input
                            id="editAge"
                            name="age"
                            type="number"
                            min="0"
                            max="120"
                            value="${escapeHTML(
                                getPatientAge(patient) === "—"
                                    ? ""
                                    : getPatientAge(patient)
                            )}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="editGender">Gender *</label>
                        <select id="editGender" name="gender" required>
                            <option value="">Select gender</option>
                            <option value="Male" ${
                                getPatientGender(patient) === "Male" ? "selected" : ""
                            }>Male</option>
                            <option value="Female" ${
                                getPatientGender(patient) === "Female" ? "selected" : ""
                            }>Female</option>
                            <option value="Other" ${
                                getPatientGender(patient) === "Other" ? "selected" : ""
                            }>Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editPhone">Phone Number</label>
                        <input
                            id="editPhone"
                            name="phone"
                            value="${escapeHTML(patient.phone || patient.phoneNumber || "")}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="editBloodGroup">Blood Group</label>
                        <select id="editBloodGroup" name="bloodGroup">
                            <option value="">Select blood group</option>
                            ${bloodGroups.map(group => `
                                <option
                                    value="${group}"
                                    ${selectedBloodGroup === group ? "selected" : ""}
                                >${group}</option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editDepartment">Department</label>
                        <select id="editDepartment" name="department">
                            ${departments.map(department => `
                                <option
                                    value="${department}"
                                    ${selectedDepartment === department ? "selected" : ""}
                                >${department}</option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editPriority">Priority</label>
                        <select id="editPriority" name="priority">
                            <option value="REGULAR" ${
                                getPatientPriority(patient) === "REGULAR" ? "selected" : ""
                            }>Regular</option>
                            <option value="EMERGENCY" ${
                                getPatientPriority(patient) === "EMERGENCY" ? "selected" : ""
                            }>Emergency</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editAddress">Address</label>
                        <textarea
                            id="editAddress"
                            name="address"
                            rows="3"
                        >${escapeHTML(patient.address || "")}</textarea>
                    </div>

                    <div class="form-group full-width">
                        <label for="editSymptoms">Symptoms / Reason for Visit</label>
                        <textarea
                            id="editSymptoms"
                            name="symptoms"
                            rows="3"
                        >${escapeHTML(patient.symptoms || "")}</textarea>
                    </div>
                </div>

                <div class="form-footer">
                    <p class="required-note">
                        Patient ID: ${escapeHTML(getPatientId(patient) || "—")}
                    </p>

                    <div class="form-buttons">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            id="cancelPatientEdit"
                        >
                            Cancel
                        </button>

                        <button type="submit" class="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.getElementById("cancelPatientEdit")
        ?.addEventListener("click", () => {
            renderPatientRecord(currentEditingPatient);
        });

    document.getElementById("patientUpdateForm")
        ?.addEventListener("submit", updatePatient);
}

/* =====================================================
   UPDATE HANDLER
===================================================== */

function setupPatientUpdateHandler() {
    // The dynamically generated form attaches its own submit handler.
}

/* =====================================================
   SAVE PATIENT UPDATES
===================================================== */

async function updatePatient(event) {
    event.preventDefault();

    if (!currentEditingPatient) {
        showToast("No patient selected for updating.", "error");
        return;
    }

    const patientId = getPatientId(currentEditingPatient);

    if (!patientId) {
        showToast("Patient ID is missing. Cannot update this record.", "error");
        return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const updatedPatient = {
        ...currentEditingPatient,
        name: String(formData.get("name") || "").trim(),
        age: Number(formData.get("age")),
        gender: String(formData.get("gender") || ""),
        phone: String(formData.get("phone") || "").trim(),
        bloodGroup: String(formData.get("bloodGroup") || ""),
        department: String(formData.get("department") || ""),
        priority: String(formData.get("priority") || "REGULAR"),
        address: String(formData.get("address") || "").trim(),
        symptoms: String(formData.get("symptoms") || "").trim()
    };

    if (!updatedPatient.name) {
        showToast("Patient name cannot be empty.", "error");
        return;
    }

    if (
        !Number.isFinite(updatedPatient.age) ||
        updatedPatient.age < 0 ||
        updatedPatient.age > 120
    ) {
        showToast("Please enter a valid age.", "error");
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    setButtonLoading(submitButton, true, "Saving...");

    try {
        await apiRequest(
            `${API_BASE}/${encodeURIComponent(patientId)}`,
            {
                method: "PUT",
                body: JSON.stringify(updatedPatient)
            }
        );

        addActivity(
            "Patient Updated",
            `${updatedPatient.name}'s details have been updated.`,
            "✎"
        );

        showToast("Patient details updated successfully!", "success");

        await loadDashboard({ silent: true });

        const refreshedPatient = await apiRequest(
            `${API_BASE}/${encodeURIComponent(patientId)}`
        );

        currentEditingPatient = refreshedPatient || updatedPatient;

        renderPatientRecord(currentEditingPatient);
    } catch (error) {
        console.error("Patient update error:", error);

        showToast(
            `Could not update patient: ${error.message}`,
            "error"
        );
    } finally {
        setButtonLoading(submitButton, false);
    }
}

/* =====================================================
   REFRESH CURRENT PATIENT RECORD
===================================================== */

function updateSearchResultIfNeeded() {
    const container = document.getElementById("searchResult");

    if (!container || !currentEditingPatient) return;

    const currentId = getPatientId(currentEditingPatient);

    if (!currentId) return;

    const updatedPatient = allPatients.find(patient => {
        return String(getPatientId(patient)) === String(currentId);
    });

    if (updatedPatient) {
        currentEditingPatient = updatedPatient;
    }
}

/* =====================================================
   ACTIVITY FEED
===================================================== */

function addActivity(title, description, icon = "✓") {
    const feed = document.getElementById("activityFeed");

    if (!feed) return;

    const emptyMessage = feed.querySelector(".empty-activity");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const item = document.createElement("div");

    item.className = "activity-item";

    item.innerHTML = `
        <div class="activity-item-icon">
            ${escapeHTML(icon)}
        </div>

        <div class="activity-item-content">
            <h4>${escapeHTML(title)}</h4>
            <p>${escapeHTML(description)}</p>
        </div>

        <span class="activity-time">
            ${new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            })}
        </span>
    `;

    feed.prepend(item);

    while (feed.children.length > 8) {
        feed.lastElementChild.remove();
    }
}

/* =====================================================
   TOAST NOTIFICATIONS
===================================================== */

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const messageElement = document.getElementById("toastMessage");
    const iconElement = document.getElementById("toastIcon");

    if (!toast || !messageElement) {
        console.log(message);
        return;
    }

    messageElement.textContent = message;

    toast.classList.remove("error", "warning", "success", "show");
    toast.classList.add(type);

    if (iconElement) {
        iconElement.textContent =
            type === "error" ? "!" :
            type === "warning" ? "!" : "✓";
    }

    void toast.offsetWidth;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

/* =====================================================
   BUTTON LOADING STATE
===================================================== */

function setButtonLoading(
    button,
    loading,
    loadingText = "Please wait..."
) {
    if (!button) return;

    if (loading) {
        if (button.dataset.originalText === undefined) {
            button.dataset.originalText = button.innerHTML;
        }

        button.disabled = true;
        button.innerHTML = escapeHTML(loadingText);
    } else {
        button.disabled = false;

        if (button.dataset.originalText !== undefined) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}

/* =====================================================
   MANUAL REFRESH
===================================================== */

async function refreshHospitalData() {
    await loadDashboard();
}

/* =====================================================
   END OF CAREFLOW SCRIPT
===================================================== */
