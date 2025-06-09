function validateEmptyString(idCampo) {
    const campo = document.getElementById(idCampo);

    if (campo.value.trim() === "") {
        campo.classList.add("is-invalid");
        return false;
    } else {
        campo.classList.remove("is-invalid");
        campo.classList.add("is-valid");
        return true;
    }
}

function validateEmail(idCampo) {
    const campo = document.getElementById(idCampo);

    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexEmail.test(campo.value.trim())) {
        campo.classList.add("is-invalid");
        return false;
    } else {
        campo.classList.remove("is-invalid");
        campo.classList.add("is-valid");
        return true;
    }
}

function validateDates(idCampo) {
    const campo = document.getElementById(idCampo);

    const fecha = new Date(campo.value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();

    const edadReal = (
        edad > 13 || (edad === 13 && hoy >= new Date(fecha.setFullYear(fecha.getFullYear() + 13)))
    );

    if (!edadReal) {
        campo.classList.add("is-invalid");
        return false;
    } else {
        campo.classList.remove("is-invalid");
        campo.classList.add("is-valid");
        return true;
    }
}

function validatePassword(idPassword, idConfirmar) {
    const pass = document.getElementById(idPassword);
    const confirm = document.getElementById(idConfirmar);

    const regexSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    let valido = true;

    if (!regexSegura.test(pass.value)) {
        pass.classList.add("is-invalid");
        valido = false;
    } else {
        pass.classList.remove("is-invalid");
        pass.classList.add("is-valid");
    }

    if (pass.value !== confirm.value || confirm.value === "") {
        confirm.classList.add("is-invalid");
        valido = false;
    } else {
        confirm.classList.remove("is-invalid");
        confirm.classList.add("is-valid");
    }

    return valido;
}