let $homePrice = null;
let $downPaymentAmount = null;
let $downPaymentPercentage = null;
let $interestRate = null;

let $propertyTax = null;
let $propertyTaxFrequency = null;

let $homeInsurance = null;
let $homeInsuranceFrequency = null;

let $pmi = null;
let $pmiFrequency = null;
let $hoa = null;
let $hoaFrequency = null;
let $loanTerm = null;

function fieldAsCurrency(selector, initialValue = 0) {

    return new AutoNumeric(selector, initialValue, {
        currencySymbol: "$ ",
        currencySymbolPlacement: "p",
        decimalCharacter: ".",
        digitGroupSeparator: ",",
        emptyInputBehavior: 'min',
        minimumValue: 0,
        maximumValue: 1000000000,
        decimalPlaces: 2,
        negativePositiveSignPlacement: "r",
    })
}

function fieldAsPercentage(selector, initialValue = 0) {

    return new AutoNumeric(selector, initialValue, {
        currencySymbol: "",
        currencySymbolPlacement: "p",
        decimalCharacter: ".",
        digitGroupSeparator: ",",
        emptyInputBehavior: 'min',
        minimumValue: 0,
        maximumValue: 100,
        decimalPlaces: 2,
        negativePositiveSignPlacement: "r",
        rawValueDivisor: 100,
        suffixText: "",
        wheelStep: 0.0001
    })
}

function fieldAsSelect(selector, initialValue = "") {

    const $el = $(selector);

    // if (initialValue) {
    //     $el.val(initialValue);
    // }

    return $el;
}

function calculateDownPaymentAmount() {

    let homePrice = parseFloat($homePrice.get());
    let percentage = parseFloat($downPaymentPercentage.get());

    $downPaymentAmount.set(homePrice * percentage)
}

function calculateDownPaymentPercentage() {

    let homePrice = parseFloat($homePrice.get());
    let amount = parseFloat($downPaymentAmount.get());

    $downPaymentPercentage.set(amount / homePrice);
}

function calculateValueByMonth(value, frequency = "yearly") {

    if (frequency === "yearly") {
        return value / 12;
    }

    return value;
}

function calculateMorgage() {

    let homePrice = parseFloat($homePrice.get());
    let downPayment = parseFloat($downPaymentAmount.get());
    let loanTerm = parseFloat($loanTerm.val());
    let interestRate = parseFloat($interestRate.get());

    let propertyTax = parseFloat($propertyTax.get());
    let propertyTaxFrequency = $propertyTaxFrequency.val();
    let homeInsurance = parseFloat($homeInsurance.get());
    let homeInsuranceFrequency = $homeInsuranceFrequency.val();
    let pmi = parseFloat($pmi.get());
    let pmiFrequency = $pmiFrequency.val();
    let hoa = parseFloat($hoa.get());
    let hoaFrequency = $hoaFrequency.val();

    const I = interestRate / 12;
    const N = 12 * loanTerm;
    const P = homePrice - downPayment;
    const principalAndInterest = P * (I * Math.pow(1 + I, N)) / (Math.pow(1 + I, N) - 1);

    const taxesByMonth = calculateValueByMonth(propertyTax, propertyTaxFrequency);
    const homeInsuranceByMonth = calculateValueByMonth(homeInsurance, homeInsuranceFrequency);
    const pmiByMonth = calculateValueByMonth(pmi, pmiFrequency);
    const hoaByMonth = calculateValueByMonth(hoa, hoaFrequency);

    const taxesAndFees = taxesByMonth + homeInsuranceByMonth + pmiByMonth + hoaByMonth;
    const monthyPayment = principalAndInterest + taxesAndFees;

    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    $("#monthly-payment").text(USDollar.format(monthyPayment));
    $("#principal-and-interest").text(USDollar.format(principalAndInterest));
    $("#taxes-and-fees").text(USDollar.format(taxesAndFees));
}

$(function () {

    const values = {
        homePrice: 100000,
        downPaymentPercentage: 0.15,
        loanTerm: 30,
        interestRate: 0.075,
        propertyTax: {
            value: 0,
            frequency: "yearly"
        },
        homeInsurance: {
            value: 0,
            frequency: "yearly"
        },
        pmi: {
            value: 0,
            frequency: "monthly"
        },
        hoa: {
            value: 0,
            frequency: "monthly"
        }
    };

    $homePrice = fieldAsCurrency('#home-price', values.homePrice);
    $downPaymentAmount = fieldAsCurrency('#down-payment-amount', values.homePrice * values.downPaymentPercentage);
    $downPaymentPercentage = fieldAsPercentage('#down-payment-percentage', values.downPaymentPercentage);
    $interestRate = fieldAsPercentage('#interest-rate', values.interestRate);

    $propertyTax = fieldAsCurrency('#property-tax', values.propertyTax.value);
    $propertyTaxFrequency = fieldAsSelect('#property-tax-frequency', values.propertyTax.frequency);

    $homeInsurance = fieldAsCurrency('#home-insurance', values.homeInsurance.value);
    $homeInsuranceFrequency = fieldAsSelect('#home-insurance-frequency', values.homeInsurance.frequency);

    $pmi = fieldAsCurrency('#pmi', values.pmi.value);
    $pmiFrequency = fieldAsSelect('#pmi-frequency', values.pmi.frequency);

    $hoa = fieldAsCurrency('#hoa', values.hoa.value);
    $hoaFrequency = fieldAsSelect('#hoa-frequency', values.hoa.frequency);

    $loanTerm = fieldAsSelect("#loan-term", values.loanTerm);

    $("#home-price").on("change", function () {
        calculateDownPaymentAmount();
    });

    $("#down-payment-percentage").on("change", function () {
        calculateDownPaymentAmount();
    });

    $("#down-payment-amount").on("change", function () {
        calculateDownPaymentPercentage();
    });

    $(".calculate-morgage").on("change", function () {
        calculateMorgage();
    });

    calculateMorgage();
});