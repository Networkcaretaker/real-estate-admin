# Notes

## Property_Images.tsx

1. If user clicks away from editing mode, there needs to be a confirmation warning "Warning: Changes Not Saved" with Confirm/Cancel option.

## Property.tsx

1. Image gallery needs 2 states. The edit button in the section will control the states.
    - Main, The images should not have any options to delete, drag and drop, or feature image selection. all text/icon overlay should be removed.
    - Main view should also show the property title if it is available.
    - Also if the image is clicked in the main view it should enlarge with full description
    - Editable, as it is now.
    - Images should be arranged without always updating firebase, will need option to arrange images and then confirm or cancel.
    - The image order in firebase will only be done after confirmation.

## Properties.tsx

1. Proper Search and Filter Feature, crate a component. maybe as fixed or popdown header.
2. Three table views.
    - Cards: with feature image, property details and excerpt (Similar to website format)
    - Actions: As it is now with actions and status
    - List: Tight table view with most columns and no image