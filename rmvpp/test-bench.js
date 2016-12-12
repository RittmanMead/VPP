
// This will get populated from the plugins testData variable
var testData = [[],[]];

$("#testbenchprefix").on('change',function(){
    processNarrativeForm();
});

$("#testbenchnarrative").on('change',function(){
    processNarrativeForm();
});

$("#testbenchpostfix").on('change',function(){
    processNarrativeForm();
});

function processNarrativeForm() {
   
    $('#parameterform').remove();
    $('#narrativePreview').remove();
    $('#'+rmvpp.selectedPlugin + "_narrative").remove();
    $('body').append('<div id=narrativePreview></div>');
   
    var previewCode = $("#testbenchprefix").val();
    
    // Substitute column placeholders with data from dataFromBIEE array
    for ( row in testData )  {
        var narrativeCode=$('#testbenchnarrative').val();
        for ( col in testData[row])    {
            narrativeCode = narrativeCode.replace(new RegExp("@"+((+col*1)+1)),testData[row][col]) ; 
        }   
        previewCode += narrativeCode;
       
    }

    previewCode +=  $("#testbenchpostfix").val();
    
    $('#narrativePreview').append(previewCode);
}

$('#testbenchprefix').val('<' + rmvpp.rmvppInvokeTag + '>');
$('#testbenchnarrative').change();