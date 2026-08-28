<?php
$filename = $_POST["filename"] ? $_POST["filename"] : "caption";
$filename .= ".xlsx";
include_once('xlsxWriter.php');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE);

header('Content-disposition: attachment;   filename="'.XLSXWriter::sanitize_filename($filename).'"');
header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header('Content-Transfer-Encoding: binary');
header('Cache-Control: must-revalidate');
header('Pragma: public');

if ($_POST["format"] == 'smi'){
	$header = array(
		'INDEX'=>'string',
		'START'=>'string',
		'START TIME'=>'string',
		'TEXT'=>'string',
		'MEMO'=>'string'
	);
	$caption = array();
	$caption_array = json_decode($_POST["caption"], true);
	foreach ($caption_array as $eq => $timeline){
		$timeline['starttime'] = substr($timeline['starttime'], 0, -1);
		$timeline['starttime'] =  str_replace(',',':',$timeline['starttime']);
		array_push($caption, array(
			$eq + 1,
			$timeline['start'],
			$timeline['starttime'],
			$timeline['text'],
			$timeline['memo']
		));
	}

} else if ($_POST["format"] == 'srt') {
	$header = array(
		'INDEX'=>'string',
		'START'=>'string',
		'START TIME'=>'string',
		'END'=>'string',
		'END TIME'=>'string',
		'TEXT'=>'string',
		'MEMO'=>'string'
	);
	$caption = array();
	$caption_array = json_decode($_POST["caption"], true);
	foreach ($caption_array as $eq => $timeline){
		$timeline['starttime'] = substr($timeline['starttime'], 0, -1);
		$timeline['starttime'] =  str_replace(',',':',$timeline['starttime']);
		$timeline['endtime'] = substr($timeline['endtime'], 0, -1);
		$timeline['endtime'] =  str_replace(',',':',$timeline['endtime']);
		array_push($caption, array(
			$eq + 1,
			$timeline['start'],
			$timeline['starttime'],
			$timeline['end'],
			$timeline['endtime'],
			$timeline['text'],
			$timeline['memo']
		));
	}
}
$writer = new XLSXWriter();
$writer->setAuthor('caption.devco.kr');
$writer->writeSheet($caption,'Sheet1',$header);
$writer->writeToStdOut();
?>