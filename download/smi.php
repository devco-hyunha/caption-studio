<?php
$filename = $_POST["filename"] ? $_POST["filename"] : "caption";
$encoding = $_POST["encode_smi_file"] ? $_POST["encode_smi_file"] : "UTF-8";
$filename .= ".smi";
header("Content-type: text/plain; charset=".$encoding);
header("Content-Disposition: attachment; filename=$filename");
$signature = '';
if (!empty($_POST["signature"])) {
	$signature = "<!--\r\n".$_POST["signature"]."\r\n-->\r\n";
}
$lang_key = $_POST["lang_key"];
$caption_array = json_decode($_POST["caption"], true);
$caption_body = "";

$patterns[0] = '&amp;';
$patterns[1] = '&lt;';
$patterns[2] = '&lt';
$patterns[3] = '&gt;';
$patterns[4] = '&gt';
$replacements[0] = '&';
$replacements[1] = '<';
$replacements[2] = '<';
$replacements[3] = '>';
$replacements[4] = '>';

foreach ($caption_array as $eq => $timeline){
	if ($timeline["text"] == "") {
		$timeline['text'] = "&nbsp;";
	} else {
		$timeline['text'] = str_replace($patterns, $replacements, $timeline['text']);
	}
	$caption_body .= "<SYNC Start=".$timeline['start']."><P Class=".$lang_key.">".$timeline['text']."</P></SYNC>\r\n";
}
$caption_print = "<SAMI>\r\n<HEAD>\r\n<Title>Caption Studio - (c)2017 DEVCO Studio ".$_SERVER['HTTP_REFERER']."</Title>\r\n<SAMIParam>\r\n\tMetrics {time:ms;}\r\n\tSpec {MSFT:1.0;}\r\n</SAMIParam>\r\n<STYLE TYPE=\"text/css\">\r\n\tp {margin-left:8pt; margin-right:8pt; margin-bottom:2pt; margin-top:2pt;text-align:center;font-size:20pt; font-family:arial, sans-serif;font-weight:normal; color:White;}\r\n\t.".$lang_key." {".$_POST["lang_value"]."}\r\n</STYLE>\r\n</HEAD>\r\n".$signature."\r\n<BODY>\r\n".$caption_body."\r\n</BODY>\r\n</SAMI>";

$caption_print = mb_convert_encoding($caption_print, $encoding);
print $caption_print;
?>