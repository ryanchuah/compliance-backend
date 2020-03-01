"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
const { WebhookClient } = require("dialogflow-fulfillment");
const info = {};
var currentUsername;
process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements
router.post("/", (request, response) => {
    try {
        var agent = new WebhookClient({ request, response });
    } catch (err) {
        console.log("===AGENT ERROR===");
        console.log(err);
    }
    // console.log(
    //     "Dialogflow Request headers: " + JSON.stringify(request.headers)
    // );
    // console.log("Dialogflow Request body: " + JSON.stringify(request.body));
    function handleNameInitial(agent) {
        agent.add("What’s your name?");
    }
    function handleContactPersonNameInitial(agent) {
        agent.add(
            "What is the name of the contact person in your organization?"
        );
    }
    function handleKnowClassOfMedicalDeviceInitial(agent) {
        agent.add(
            "Do you know which class of Medical Device your software belongs to according to MHRA rules?"
        );
    }
    function handleKnowClassOfMedicalDeviceYes(agent) {
        agent.add("Great! You’re all set!");
    }
    function handleKnowClassOfMedicalDeviceNo(agent) {
        agent.add("Does the MD not touch patient or contact only intact skin?");
    }
    function handleNotTouchPatientYes(agent) {
        agent.add("Class I");
    }
    function handleNotTouchPatientNo(agent) {
        agent.add(
            "Does the MD involve channelling or storing for eventual administration?"
        );
    }
    function handleChannelingForAdministrationYes(agent) {
        agent.add(
            "Is the MD to be used with blood, other bodily fluids, organs or tissues?"
        );
    }
    function handleChannelingForAdministrationNo(agent) {
        agent.add(
            "Does the MD modify biological or chemical composition of blood, body liquids, or other liquids intended for infusion?"
        );
    }
    function handleUsedWithBloodYes(agent) {
        agent.add("Class IIa");
    }
    function handleUsedWithBloodNo(agent) {
        agent.add(
            "May the MD be connected to an active medical device in Class IIa or higher?"
        );
    }
    function handleModifyBiologicalCompositionYes(agent) {
        agent.add(
            "Is the MD only for filtration, centrifiguration, or exchange of gas or heat?"
        );
    }
    function handleModifyBiologicalCompositionNo(agent) {
        agent.add(
            "Does the MD involve contact with injured skin (mechanical barrier, compression, absorb exudates)?"
        );
    }
    function handleConnectedToActiveMedicalDeviceYes(agent) {
        agent.add("Class I");
    }
    function handleConnectedToActiveMedicalDeviceNo(agent) {
        agent.add("Class IIa");
    }
    function handleFiltrationCentrifigurationYes(agent) {
        agent.add("Class IIa");
    }
    function handleFiltrationCentrifigurationNo(agent) {
        agent.add("Class IIb");
    }
    function handleContactWithInjuredSkinYes(agent) {
        agent.add(
            "Is the MD intended for wounds which breach dermis and heal only by secondary intent?"
        );
    }
    function handleContactWithInjuredSkinNo(agent) {
        agent.add(
            "Is the MD invasive in body orifice or stoma (not surgically)?"
        );
    }
    function handleWoundsWhichBreachDermisYes(agent) {
        agent.add("Class IIb");
    }
    function handleWoundsWhichBreachDermisNo(agent) {
        agent.add(
            "Yes, is the MD intended to manage micro-environment of wounds + others?"
        );
    }
    function handleInvasiveInBodyOrificeYes(agent) {
        agent.add("Is the MD for trancient use?");
    }
    function handleInvasiveInBodyOrificeNo(agent) {
        agent.add("Is the MD surgically invasive and for trancient use?");
    }
    function handleManageMicroEnvironmentsYes(agent) {
        agent.add("Class IIa");
    }
    function handleManageMicroEnvironmentsNo(agent) {
        agent.add("Class I");
    }
    function handleTrancientUseYes(agent) {
        agent.add("Class I");
    }
    function handleTrancientUseNo(agent) {
        agent.add("Is the MD for short-term use?");
    }
    function handleSurgicallyInvasiveYes(agent) {
        agent.add(
            "Is the MD specifically to control/diagnose/monitor/correct a defect of heart or central circulatory system through direct contact?"
        );
    }
    function handleSurgicallyInvasiveNo(agent) {
        agent.add("Is the MD surgically invasive and for short-term use?");
    }
    function handleShortTermUseYes(agent) {
        agent.add(
            "Is the MD only for use in oral cavity, ear canal, or in nasal cavity?"
        );
    }
    function handleShortTermUseNo(agent) {
        agent.add("Is the MD for long-term use?");
    }
    function handleControlDiagnoseMonitorOrCorrectYes(agent) {
        agent.add("Class III");
    }
    function handleControlDiagnoseMonitorOrCorrectNo(agent) {
        agent.add(
            "Is the MD or use in direct contact with the central nervous systerm?"
        );
    }
    function handleSurgicallyInvasiveAndShortTermUseYes(agent) {
        agent.add(
            "Is the MD for use in direct contact with the central nervous system?"
        );
    }
    function handleSurgicallyInvasiveAndShortTermUseNo(agent) {
        agent.add(
            "Is the MD surgically invasive, for long term use, or is an implantable device?"
        );
    }
    function handleOralCavityEarCanalYes(agent) {
        agent.add("Class I");
    }
    function handleOralCavityEarCanalNo(agent) {
        agent.add("Class IIa");
    }
    function handleLongTermUseYes(agent) {
        agent.add(
            "Is the MD only for use in oral cavity, ear canal, or in nasal cavity and is not liable to be absorbed by the mucous membrane?"
        );
    }
    function handleLongTermUseNo(agent) {
        agent.add(
            "Is the MD to be connected to an active medical device in Class IIa or higher?"
        );
    }
    function handleDirectContactWithCnsYes(agent) {
        agent.add("Class III");
    }
    function handleDirectContactWithCnsNo(agent) {
        agent.add("Is the MD a reusable surgical instrument?");
    }
    function handleDirectContactWithCns2Yes(agent) {
        agent.add("Class III");
    }
    function handleDirectContactWithCns2No(agent) {
        agent.add(
            "Is the MD specifically used to monitor/control/diagnose/correct defect of heart or central circulatory system by direct contact?"
        );
    }
    function handleSurgicallyInvasiveLongTermUseYes(agent) {
        agent.add("Is the MD to be used in teeth?");
    }
    function handleSurgicallyInvasiveLongTermUseNo(agent) {
        agent.add(
            "Is the MD an active therapeutic device intended to administer or exchange energy?"
        );
    }
    function handleOralCavityEarCanalNotLiableToBeAbsorbedYes(agent) {
        agent.add("Class IIa");
    }
    function handleOralCavityEarCanalNotLiableToBeAbsorbedNo(agent) {
        agent.add("Class IIb");
    }
    function handleConnectedToActiveMedicalDevice2Yes(agent) {
        agent.add("Class IIa");
    }
    function handleReusableSurgicalInstrumentYes(agent) {
        agent.add("Class I");
    }
    function handleReusableSurgicalInstrumentNo(agent) {
        agent.add("Does the MD supply energy or ionising radiation?");
    }
    function handleMonitorControlDiagnoseOrCorrectYes(agent) {
        agent.add("Class III");
    }
    function handleMonitorControlDiagnoseOrCorrectNo(agent) {
        agent.add("Does the MD supply energy or ionising radiation?");
    }
    function handleUsedInTeethYes(agent) {
        agent.add("Class IIa");
    }
    function handleUsedInTeethNo(agent) {
        agent.add(
            "Is the MD to be used in direct contact with heart or central nervous/circulatory system?"
        );
    }
    function handleActiveTherapeuticDeviceYes(agent) {
        agent.add(
            "Does the MD administer or exchange energy in a potentially hazardous way?"
        );
    }
    function handleActiveTherapeuticDeviceNo(agent) {
        agent.add(
            "Is the MD an active device for diagnosis intended to supply energy to image in vivo distribution of radiopharmaceuticals, or for direct diagnosis or monitoring of vital physiological processes?"
        );
    }
    function handleSupplyEnergyYes(agent) {
        agent.add("Class IIb");
    }
    function handleSupplyEnergyNo(agent) {
        agent.add(
            "Does the MD have a biological effect, ie it is mainly or wholly absorbed?"
        );
    }
    function handleSupplyEnergy2Yes(agent) {
        agent.add("Class IIb");
    }
    function handleSupplyEnergy2No(agent) {
        agent.add(
            "Does the MD have a biological effect or is mainly absorbed?"
        );
    }
    function handleDirectContactWithHeartYes(agent) {
        agent.add("Class III");
    }
    function handleDirectContactWithHeartNo(agent) {
        agent.add(
            "Does the MD have a biological effect or is mainly absorbed?"
        );
    }
    function handleAdministerOrExchangeEnergyYes(agent) {
        agent.add("Class IIb");
    }
    function handleAdministerOrExchangeEnergyNo(agent) {
        agent.add(
            "Does the MD control, monitor, or influence directly the performance of a Class IIb active therapeutic device?"
        );
    }
    function handleSupplyEnergyToImageInVivoYes(agent) {
        agent.add(
            "Is the MD specifically intended to monitor vital physiological parameters where variations could result in immediate danger?"
        );
    }
    function handleSupplyEnergyToImageInVivoNo(agent) {
        agent.add(
            "Is the MD an active device to administer or remove medicines and other substances to or from the body?"
        );
    }
    function handleHaveABiologicalEffectYes(agent) {
        agent.add("Class IIb");
    }
    function handleHaveABiologicalEffectNo(agent) {
        agent.add(
            "Is the MD intended to administer medicine in a potentially hazardous manner?"
        );
    }
    function handleHaveABiologicalEffect2Yes(agent) {
        agent.add("Class III");
    }
    function handleHaveABiologicalEffect2No(agent) {
        agent.add(
            "Does the MD undergo chemical change in the body, or is used to administer medicine (not in teeth)?"
        );
    }
    function handleHaveABiologicalEffectOrMainlyAbsorbedYes(agent) {
        agent.add("Class III");
    }
    function handleHaveABiologicalEffectOrMainlyAbsorbedNo(agent) {
        agent.add(
            "Does the MD undergo chemical change in the body, or is used to administer medicine (not in teeth"
        );
    }
    function handleControlMonitorOrInfluenceYes(agent) {
        agent.add("Class IIb");
    }
    function handleControlMonitorOrInfluenceNo(agent) {
        agent.add("Class IIa");
    }
    function handleMonitorVitalPhysiologicalParametersYes(agent) {
        agent.add("Class IIb");
    }
    function handleMonitorVitalPhysiologicalParametersNo(agent) {
        agent.add(
            "Does the MD emit ionizing radiation and is intended for diagnostic and therapeutic interventional radiology?"
        );
    }
    function handleActiveDeviceToAdministerMedicinesYes(agent) {
        agent.add("Does the MD do so in a potentially hazardous way?");
    }
    function handleActiveDeviceToAdministerMedicinesNo(agent) {
        agent.add(
            "Is the MD an active medical device but is not classified by any of the above rules?"
        );
    }
    function handleAdministerMedicineYes(agent) {
        agent.add("Class IIb");
    }
    function handleAdministerMedicineNo(agent) {
        agent.add("Class IIa");
    }
    function handleUndergoChemicalChangeYes(agent) {
        agent.add("Class IIb");
    }
    function handleUndergoChemicalChangeNo(agent) {
        agent.add("Class IIa");
    }
    function handleUndergoChemicalChangeOrAdministerMedicineYes(agent) {
        agent.add("Class III");
    }
    function handleUndergoChemicalChangeOrAdministerMedicineNo(agent) {
        agent.add(
            "Is the MD for use in breast implants, or hip, knee, or shoulder joint replacements?"
        );
    }
    function handleEmitIonizingRadiationYes(agent) {
        agent.add("Class IIb");
    }
    function handleEmitIonizingRadiationNo(agent) {
        agent.add("Class IIa");
    }
    function handlePotentiallyHazardousYes(agent) {
        agent.add("Class IIb");
    }
    function handlePotentiallyHazardousNo(agent) {
        agent.add("Class IIa");
    }
    function handleActiveDeviceNotClassifiedYes(agent) {
        agent.add("Class I");
    }
    function handleActiveDeviceNotClassifiedNo(agent) {
        agent.add(
            "Does the MD incorporate integral medicinal substances liable to act in an ancillary way on the human body?"
        );
    }
    function handleUseInBreastImplantsYes(agent) {
        agent.add("Class III");
    }
    function handleUseInBreastImplantsNo(agent) {
        agent.add("Class IIb");
    }
    function handleIncorporateIntegralMedicinalSubstancesYes(agent) {
        agent.add("Class III");
    }
    function handleIncorporateIntegralMedicinalSubstancesNo(agent) {
        agent.add(
            "Is the MD used for contraception or prevention of sexually transmitted diseases?"
        );
    }
    function handleContraceptionYes(agent) {
        agent.add("Is the MD implantable or is long-term invasive?");
    }
    function handleContraceptionNo(agent) {
        agent.add("Is the MD specifically to be used for disinfecting MDs?");
    }
    function handleImplantableYes(agent) {
        agent.add("Class III");
    }
    function handleImplantableNo(agent) {
        agent.add("Class IIb");
    }
    function handleDisinfectingMdsYes(agent) {
        agent.add(
            "Is the MD specifically to be used for disinfecting, cleaning, rinsing or hydrating contact lenses?"
        );
    }
    function handleDisinfectingMdsNo(agent) {
        agent.add(
            "Is the MD intended for recording of X-ray diagnostic images?"
        );
    }
    function handleDisinfectingContactLensesYes(agent) {
        agent.add("Class IIb");
    }
    function handleDisinfectingContactLensesNo(agent) {
        agent.add(
            "Is the MD specifically to be used for disinfecting invasive MDs?"
        );
    }
    function handleRecordingOfXRayYes(agent) {
        agent.add("Class IIa");
    }
    function handleRecordingOfXRayNo(agent) {
        agent.add(
            "Does the MD utilize non-viable animal tissues or derivatives (not devices in contact with only intact skin)?"
        );
    }
    function handleDisinfectingInvasiveMdsYes(agent) {
        agent.add("Class IIb");
    }
    function handleDisinfectingInvasiveMdsNo(agent) {
        agent.add("Class IIa");
    }
    function handleNonViableAnimalTissuesYes(agent) {
        agent.add("Class III");
    }
    function handleNonViableAnimalTissuesNo(agent) {
        agent.add("Is the MD a blood bag?");
    }
    function handleBloodBagYes(agent) {
        agent.add("Class IIb");
    }
    function handleBloodBagNo(agent) {
        agent.add("Error");
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Name - Initial", handleNameInitial);
    intentMap.set(
        "Contact Person Name - Initial",
        handleContactPersonNameInitial
    );
    intentMap.set(
        "Know Class Of Medical Device - Initial",
        handleKnowClassOfMedicalDeviceInitial
    );
    intentMap.set(
        "Know Class Of Medical Device - Yes",
        handleKnowClassOfMedicalDeviceYes
    );
    intentMap.set(
        "Know-Class-Of-Medical-Device - No",
        handleKnowClassOfMedicalDeviceNo
    );
    intentMap.set("Not Touch Patient - Yes", handleNotTouchPatientYes);
    intentMap.set("Not-Touch-Patient - No", handleNotTouchPatientNo);
    intentMap.set(
        "Channeling-For-Administration - Yes",
        handleChannelingForAdministrationYes
    );
    intentMap.set(
        "Channeling-For-Administration - No",
        handleChannelingForAdministrationNo
    );
    intentMap.set("Used With Blood - Yes", handleUsedWithBloodYes);
    intentMap.set("Used-With-Blood - No", handleUsedWithBloodNo);
    intentMap.set(
        "Modify-Biological-Composition - Yes",
        handleModifyBiologicalCompositionYes
    );
    intentMap.set(
        "Modify-Biological-Composition - No",
        handleModifyBiologicalCompositionNo
    );
    intentMap.set(
        "Connected To Active Medical Device - Yes",
        handleConnectedToActiveMedicalDeviceYes
    );
    intentMap.set(
        "Connected To Active Medical Device - No",
        handleConnectedToActiveMedicalDeviceNo
    );
    intentMap.set(
        "Filtration  Centrifiguration - Yes",
        handleFiltrationCentrifigurationYes
    );
    intentMap.set(
        "Filtration  Centrifiguration - No",
        handleFiltrationCentrifigurationNo
    );
    intentMap.set(
        "Contact-With-Injured-Skin - Yes",
        handleContactWithInjuredSkinYes
    );
    intentMap.set(
        "Contact-With-Injured-Skin - No",
        handleContactWithInjuredSkinNo
    );
    intentMap.set(
        "Wounds Which Breach Dermis - Yes",
        handleWoundsWhichBreachDermisYes
    );
    intentMap.set(
        "Wounds-Which-Breach-Dermis - No",
        handleWoundsWhichBreachDermisNo
    );
    intentMap.set(
        "Invasive-In-Body-Orifice - Yes",
        handleInvasiveInBodyOrificeYes
    );
    intentMap.set(
        "Invasive-In-Body-Orifice - No",
        handleInvasiveInBodyOrificeNo
    );
    intentMap.set(
        "Manage Micro Environments - Yes",
        handleManageMicroEnvironmentsYes
    );
    intentMap.set(
        "Manage Micro Environments - No",
        handleManageMicroEnvironmentsNo
    );
    intentMap.set("Trancient Use - Yes", handleTrancientUseYes);
    intentMap.set("Trancient-Use - No", handleTrancientUseNo);
    intentMap.set("Surgically-Invasive - Yes", handleSurgicallyInvasiveYes);
    intentMap.set("Surgically-Invasive - No", handleSurgicallyInvasiveNo);
    intentMap.set("Short-Term-Use - Yes", handleShortTermUseYes);
    intentMap.set("Short-Term-Use - No", handleShortTermUseNo);
    intentMap.set(
        "Control  Diagnose  Monitor Or Correct - Yes",
        handleControlDiagnoseMonitorOrCorrectYes
    );
    intentMap.set(
        "Control--Diagnose--Monitor-Or-Correct - No",
        handleControlDiagnoseMonitorOrCorrectNo
    );
    intentMap.set(
        "Surgically-Invasive-And-Short-Term-Use - Yes",
        handleSurgicallyInvasiveAndShortTermUseYes
    );
    intentMap.set(
        "Surgically-Invasive-And-Short-Term-Use - No",
        handleSurgicallyInvasiveAndShortTermUseNo
    );
    intentMap.set("Oral Cavity  Ear Canal - Yes", handleOralCavityEarCanalYes);
    intentMap.set("Oral Cavity  Ear Canal - No", handleOralCavityEarCanalNo);
    intentMap.set("Long-Term-Use - Yes", handleLongTermUseYes);
    intentMap.set("Long-Term-Use - No", handleLongTermUseNo);
    intentMap.set(
        "Direct Contact With Cns - Yes",
        handleDirectContactWithCnsYes
    );
    intentMap.set("Direct-Contact-With-Cns - No", handleDirectContactWithCnsNo);
    intentMap.set(
        "Direct Contact With Cns  2  - Yes",
        handleDirectContactWithCns2Yes
    );
    intentMap.set(
        "Direct-Contact-With-Cns--2- - No",
        handleDirectContactWithCns2No
    );
    intentMap.set(
        "Surgically-Invasive--Long-Term-Use - Yes",
        handleSurgicallyInvasiveLongTermUseYes
    );
    intentMap.set(
        "Surgically-Invasive--Long-Term-Use - No",
        handleSurgicallyInvasiveLongTermUseNo
    );
    intentMap.set(
        "Oral Cavity  Ear Canal  Not Liable To Be Absorbed - Yes",
        handleOralCavityEarCanalNotLiableToBeAbsorbedYes
    );
    intentMap.set(
        "Oral Cavity  Ear Canal  Not Liable To Be Absorbed - No",
        handleOralCavityEarCanalNotLiableToBeAbsorbedNo
    );
    intentMap.set(
        "Connected To Active Medical Device  2  - Yes",
        handleConnectedToActiveMedicalDevice2Yes
    );
    intentMap.set(
        "Reusable Surgical Instrument - Yes",
        handleReusableSurgicalInstrumentYes
    );
    intentMap.set(
        "Reusable-Surgical-Instrument - No",
        handleReusableSurgicalInstrumentNo
    );
    intentMap.set(
        "Monitor  Control  Diagnose Or Correct - Yes",
        handleMonitorControlDiagnoseOrCorrectYes
    );
    intentMap.set(
        "Monitor--Control--Diagnose-Or-Correct - No",
        handleMonitorControlDiagnoseOrCorrectNo
    );
    intentMap.set("Used In Teeth - Yes", handleUsedInTeethYes);
    intentMap.set("Used-In-Teeth - No", handleUsedInTeethNo);
    intentMap.set(
        "Active-Therapeutic-Device - Yes",
        handleActiveTherapeuticDeviceYes
    );
    intentMap.set(
        "Active-Therapeutic-Device - No",
        handleActiveTherapeuticDeviceNo
    );
    intentMap.set("Supply Energy - Yes", handleSupplyEnergyYes);
    intentMap.set("Supply-Energy - No", handleSupplyEnergyNo);
    intentMap.set("Supply Energy  2  - Yes", handleSupplyEnergy2Yes);
    intentMap.set("Supply-Energy--2- - No", handleSupplyEnergy2No);
    intentMap.set(
        "Direct Contact With Heart - Yes",
        handleDirectContactWithHeartYes
    );
    intentMap.set(
        "Direct-Contact-With-Heart - No",
        handleDirectContactWithHeartNo
    );
    intentMap.set(
        "Administer Or Exchange Energy - Yes",
        handleAdministerOrExchangeEnergyYes
    );
    intentMap.set(
        "Administer-Or-Exchange-Energy - No",
        handleAdministerOrExchangeEnergyNo
    );
    intentMap.set(
        "Supply-Energy-To-Image-In-Vivo - Yes",
        handleSupplyEnergyToImageInVivoYes
    );
    intentMap.set(
        "Supply-Energy-To-Image-In-Vivo - No",
        handleSupplyEnergyToImageInVivoNo
    );
    intentMap.set(
        "Have A Biological Effect - Yes",
        handleHaveABiologicalEffectYes
    );
    intentMap.set(
        "Have-A-Biological-Effect - No",
        handleHaveABiologicalEffectNo
    );
    intentMap.set(
        "Have A Biological Effect  2  - Yes",
        handleHaveABiologicalEffect2Yes
    );
    intentMap.set(
        "Have-A-Biological-Effect--2- - No",
        handleHaveABiologicalEffect2No
    );
    intentMap.set(
        "Have A Biological Effect Or Mainly Absorbed - Yes",
        handleHaveABiologicalEffectOrMainlyAbsorbedYes
    );
    intentMap.set(
        "Have-A-Biological-Effect-Or-Mainly-Absorbed - No",
        handleHaveABiologicalEffectOrMainlyAbsorbedNo
    );
    intentMap.set(
        "Control  Monitor Or Influence - Yes",
        handleControlMonitorOrInfluenceYes
    );
    intentMap.set(
        "Control  Monitor Or Influence - No",
        handleControlMonitorOrInfluenceNo
    );
    intentMap.set(
        "Monitor Vital Physiological Parameters - Yes",
        handleMonitorVitalPhysiologicalParametersYes
    );
    intentMap.set(
        "Monitor-Vital-Physiological-Parameters - No",
        handleMonitorVitalPhysiologicalParametersNo
    );
    intentMap.set(
        "Active-Device-To-Administer-Medicines - Yes",
        handleActiveDeviceToAdministerMedicinesYes
    );
    intentMap.set(
        "Active-Device-To-Administer-Medicines - No",
        handleActiveDeviceToAdministerMedicinesNo
    );
    intentMap.set("Administer Medicine - Yes", handleAdministerMedicineYes);
    intentMap.set("Administer Medicine - No", handleAdministerMedicineNo);
    intentMap.set(
        "Undergo Chemical Change - Yes",
        handleUndergoChemicalChangeYes
    );
    intentMap.set(
        "Undergo Chemical Change - No",
        handleUndergoChemicalChangeNo
    );
    intentMap.set(
        "Undergo Chemical Change Or Administer Medicine - Yes",
        handleUndergoChemicalChangeOrAdministerMedicineYes
    );
    intentMap.set(
        "Undergo-Chemical-Change-Or-Administer-Medicine - No",
        handleUndergoChemicalChangeOrAdministerMedicineNo
    );
    intentMap.set(
        "Emit Ionizing Radiation - Yes",
        handleEmitIonizingRadiationYes
    );
    intentMap.set(
        "Emit Ionizing Radiation - No",
        handleEmitIonizingRadiationNo
    );
    intentMap.set("Potentially Hazardous - Yes", handlePotentiallyHazardousYes);
    intentMap.set("Potentially Hazardous - No", handlePotentiallyHazardousNo);
    intentMap.set(
        "Active Device Not Classified - Yes",
        handleActiveDeviceNotClassifiedYes
    );
    intentMap.set(
        "Active-Device-Not-Classified - No",
        handleActiveDeviceNotClassifiedNo
    );
    intentMap.set("Use In Breast Implants - Yes", handleUseInBreastImplantsYes);
    intentMap.set("Use In Breast Implants - No", handleUseInBreastImplantsNo);
    intentMap.set(
        "Incorporate Integral Medicinal Substances - Yes",
        handleIncorporateIntegralMedicinalSubstancesYes
    );
    intentMap.set(
        "Incorporate-Integral-Medicinal-Substances - No",
        handleIncorporateIntegralMedicinalSubstancesNo
    );
    intentMap.set("Contraception - Yes", handleContraceptionYes);
    intentMap.set("Contraception - No", handleContraceptionNo);
    intentMap.set("Implantable - Yes", handleImplantableYes);
    intentMap.set("Implantable - No", handleImplantableNo);
    intentMap.set("Disinfecting-Mds - Yes", handleDisinfectingMdsYes);
    intentMap.set("Disinfecting-Mds - No", handleDisinfectingMdsNo);
    intentMap.set(
        "Disinfecting Contact Lenses - Yes",
        handleDisinfectingContactLensesYes
    );
    intentMap.set(
        "Disinfecting-Contact-Lenses - No",
        handleDisinfectingContactLensesNo
    );
    intentMap.set("Recording Of X Ray - Yes", handleRecordingOfXRayYes);
    intentMap.set("Recording-Of-X-Ray - No", handleRecordingOfXRayNo);
    intentMap.set(
        "Disinfecting Invasive Mds - Yes",
        handleDisinfectingInvasiveMdsYes
    );
    intentMap.set(
        "Disinfecting Invasive Mds - No",
        handleDisinfectingInvasiveMdsNo
    );
    intentMap.set(
        "Non Viable Animal Tissues - Yes",
        handleNonViableAnimalTissuesYes
    );
    intentMap.set(
        "Non-Viable-Animal-Tissues - No",
        handleNonViableAnimalTissuesNo
    );
    intentMap.set("Blood Bag - Yes", handleBloodBagYes);
    intentMap.set("Blood Bag - No", handleBloodBagNo);

    agent.handleRequest(intentMap);
});

module.exports = router;
