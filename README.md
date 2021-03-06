elevator-demo
=============
<p>
	This application was born from the need for a sample project unrestricted by existing non-disclosure agreements. It is intended to be a simplified version of the classic 'Elevator Paradox' and demonstrates the use of RequireJS and KnockoutJS in a completely AMD based modular application.
</p>
<p>
	The KnockoutJS framework, decouples the HTML document from the Javascript code thereby eliminating the need for error prone event handlers and Jquery calls. <br />
	All animations in this application are CSS3 based making for a very light and environmentally independent codebase.
</p>
<p>
	A combination of percentage based values and @media queries provide smartphone compatible pure CSS3 responsive content viewable across a wide array of modern browsers.
</p>
<p>
	The design pattern for this app diverges from Knockout's datacentric Model-View-Viewmodel pattern to take more of a hybrid approach with the program logic residing in a controller which communicates through the viewmodel.
</p>
<p>
	The reasoning is that for this particular project there really is no backend data to manage and since Viewmodels are by design strongly typed, it made sense to have the program logic self contained.
</p>
