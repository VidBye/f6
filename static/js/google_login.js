function profile_click()
{
   
   // Get the element by its ID
var profile_dropdown_list = document.getElementById("profile_dropdown_list");


   console.log(profile_dropdown_list)
   
    profile_dropdown_list.classList.add("profile_item");
    profile_dropdown_list.classList.remove("profile_item_disabled");
    

}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    var profile_dropdown_list = document.getElementById("profile_dropdown_list");
    var profile_icon = document.getElementById("proflie_icon");
    
    // If clicked element is not the dropdown or the profile icon, close the dropdown
    if (profile_dropdown_list && profile_icon && !profile_dropdown_list.contains(event.target) && event.target !== profile_icon) {
        profile_dropdown_list.classList.remove("profile_item");
        profile_dropdown_list.classList.add("profile_item_disabled");
    }
}, true);