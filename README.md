# SurvaiderDashboard
Angular JS based solution for dashboard functionality

It contains the fixes for the following:
- ~~Automate the listing of channel tabs on top 'Zomato' 'TripAdvisor' 'Facebook' etc, depending on which channels are returned in the API.~~ : ![alt text](http://findicons.com/files/icons/1588/farm_fresh_web/32/tick.png "Done")
- Activate the channel tabs
- 'Share' popup
- 'Settings' popup
- Align the big bubble chart properly
- Make the question cards smaller in size. They are too big right now.
- On hovering over the bubble chart, just show the Y axis value of the bubble so that its easier for someone to understand the chart.
- Template of URL of units. Currently it is "/survey/s:<parent_ID>/analysis?parent=true#/unit/1" which is wrong. Change this template to "/survey/s:<child_ID>/analysis"
- URL of 'Edit Survey' button. Should be of the form "/survey/s:<parent_ID>/edit"
- Display the 'Edit Survey' button only and only if the dashboard's URL has 'parent=true'. Because only parent should be allowed to edit survey.

