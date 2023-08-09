##########################################################################
#
# modmetadataaction.pm -- 
# A component of the Greenstone digital library software
# from the New Zealand Digital Library Project at the 
# University of Waikato, New Zealand.
#
# Copyright (C) 2009 New Zealand Digital Library Project
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
###########################################################################

# See http://www.perlmonks.org/?node_id=881761 for splitting module into multiple files
# and how variables declared with 'our' are used there.

package doveraction;

# use strict;
use cgiactions::baseaction;

use dbutil;
use ghtml;
use JSON;

BEGIN {
	require XML::Rules;
}

@doveraction::ISA = ('baseaction');

my $action_table =
{
	# Execute DOVER with 2 or > input sets, returning one output set
	"run-dover" => {
	'compulsory-args' => [ "inputitems[]" ],
	'optional-args'   => [ ],
	'help-string' => [
		"run-dover initiates the combination of RTTM files using user-edit-aware methods to reduce error rates.\ninputs should be strings, output is returned as string in POST response." ] },
};

sub new 
{
	my $class = shift (@_);
	my ($gsdl_cgi,$iis6_mode) = @_;

	my $self = new baseaction($action_table,$gsdl_cgi,$iis6_mode);

	return bless $self, $class;
}

sub run_dover
{
	my $self = shift @_;
	my $gsdl_cgi = $self->{'gsdl_cgi'};

	my @input_items = @{$self->{'inputitems[]'}};

	if (!@input_items) {
		$gsdl_cgi->generate_error("No inputitems is specified: inputitems=...");
	}

	# my $last_item_pos = $#input_items;
	# my $num_items = scalar(@input_items);

	for my $i (0 .. $#input_items) {
		my $rttm_string = $input_items[$i];
		# Open the output file for writing
		open my $output_fh, ">", "dover_input_$i.rttm" or die "Could not open dover_input_$i.rttm: $!";
		# Write the entire RTTM string to the output file
		print $output_fh "$rttm_string\n";
		# Close the output file
		close $output_fh;
		# print STDERR "RTTM $i written to dover_input_$i.rttm\n";
	}

	# Call DOVER-Lock with newly generated files 
	my $dover_result = "dover_output.rttm";
	my $dover_tmp_dir = "tmp/DOVER-Lock/$$"; # tmp/DOVER-Lock/PID
	# my $cmd = "dover dover_input_* > $dover_result";
	# my $cmd = "/Scratch/fwi1/wavesurfer-experiments/dover/scripts/dover dover_input_* > $dover_result";
	my $cmd = "dover-lock -tmpdir $dover_tmp_dir dover_input_* > $dover_result";
	print STDERR "\n\n*****\n\n CMD=\n$cmd \n\n*****\n\n";
	my $status = system($cmd);
	print STDERR "\n\n*****\n\n command status=\n$status \n\n*****\n\n";
	if ($status != 0) { print STDERR "\n\n Failed to run \n $cmd \n $! \n\n"; }
	else {
		# Read DOVER-Lock result
		open my $input_fh, "<", $dover_result;
		my $text = join('', <$input_fh>);
		# Send RTTM string as POST result
		$gsdl_cgi->generate_ok_message($text);
	}
}

1;