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
	'optional-args'   => [ ] },
};

sub new 
{
	my $class = shift (@_);
	my ($gsdl_cgi,$iis6_mode) = @_;
	# my @input_items = $gsdl_cgi->multi_param('inputitems[]');
	# print STDERR "*** new input_items= ", join("|", @input_items), "\n";
	# print STDERR "what is input items[] = ", $gsdl_cgi->param('inputitems[]'), "\n\n\n";

	my $self = new baseaction($action_table,$gsdl_cgi,$iis6_mode);
	# $self->{'inputitems'} = \@input_items;
	return bless $self, $class;
}

sub run_dover
{
	my $self = shift @_;
	my $gsdl_cgi = $self->{'gsdl_cgi'};

	# my $input_items_str = $self->{'inputitems'};
	# my @input_items = decode_json $input_items;
	my @input_items = @{$self->{'inputitems[]'}};
	# print STDERR "input_items=@input_items\n";
	# print STDERR "*** input_items= ", join("|", @input_items), "\n";

	if (!@input_items) {
		$gsdl_cgi->generate_error("No inputitems is specified: inputitems=...");
	}

	my $get_response = undef;


	# Output file names
	# my @output_files = ("output1.rttm", "output2.rttm", "output3.rttm");

	# Convert and write each set of entries to separate files
	my $last_item_pos = $#input_items;
	# print STDERR "!!! last_item_pos= $last_item_pos\n";
	my $num_items = scalar(@input_items);
	# print STDERR "!!! num_items= $num_items\n";

	for my $i (0 .. $#input_items) {
		my $rttm_string = $input_items[$i];

		# Open the output file for writing
		open my $output_fh, '>', "dover_input_$i.rttm" or die "Could not open dover_input_$i.rttm: $!";

		# Write the entire RTTM string to the output file
		print $output_fh "$rttm_string\n";
		$get_response .= "$rttm_string\n";

		# Close the output file
		close $output_fh;

		print STDERR "RTTM $i written to dover_input_$i.rttm\n";
	}

	# call dover with newly generated files 

	# result of GET request
	$gsdl_cgi->generate_ok_message($get_response);
}

1;