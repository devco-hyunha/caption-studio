<?php

$filename = $_POST["filename"] ? $_POST["filename"] : "caption";
$encoding = $_POST["encode_srt_file"] ? $_POST["encode_srt_file"] : "UTF-8";
$filename .= ".srt";
header("Content-type: text/plain; charset=".$encoding);
header("Content-Disposition: attachment; filename=$filename");

$caption_array = json_decode($_POST["caption"], true);
$caption = "";
foreach ($caption_array as $eq => $timeline){
	$caption .= ($eq + 1) ."\r\n";
	$caption .= $timeline["starttime"]." --> ".$timeline["endtime"]."\r\n";
	$text = "";
	if ($_POST["is-style"]){
		$text = strip_tags($timeline["text"], "<br>");
	} else {
		$text = $timeline["text"];
	}
	$caption .= str_replace("<br>","\r\n",$text);
	$caption .= "\r\n\r\n";
}

$caption = mb_convert_encoding($caption, $encoding);
print $caption;
?>