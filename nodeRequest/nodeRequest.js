var dbService = require("../services/dbService.js");
var tokenService = require("../services/tokenService.js");
var fbService = require("../services/requestFbService.js");

exports.createNode = function(id,type){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var fieldRequest = '';
            switch (type) {
                case 'user':
                    fieldRequest = '?fields=id,about,age_range,bio,birthday,cover,currency,devices,education,email,favorite_athletes,favorite_teams,first_name,gender,hometown,inspirational_people,interested_in,is_verified,languages,last_name,link,locale,location,meeting_for,middle_name,name,name_format,payment_pricepoints,political,public_key,quotes,relationship_status,religion,security_settings,significant_other,sports,test_group,timezone,updated_time,verified,video_upload_limits,viewer_can_send_gift,website,work';
                    break;
                case 'post':
                    fieldRequest = '?fields=id,admin_creator,call_to_action,caption,created_time,description,feed_targeting,from,icon,is_hidden,is_published,link,message,message_tags,name,object_id,parent_id,picture,place,privacy,properties,shares,source,status_type,story,story_tags,targeting,to,type,updated_time,with_tags';
                    break;
                case 'photo':
                    fieldRequest = '?fields=id,album,backdated_time,backdated_time_granularity,can_delete,can_tag,created_time,event,from,height,icon,images,last_used_time,link,name,name_tags,owner_business,page_story_id,picture,place,updated_time,width';
                    break;
                case 'page':
                    fieldRequest = '?fields=id,about,attire,awards,band_interests,band_members,best_page,bio,birthday,booking_agent,built,business,can_checkin,can_post,category,category_list,checkins,company_overview,contact_address,country_page_likes,cover,culinary_team,current_location,description,directed_by,display_subtext,emails,engagement,fan_count,featured_video,features,food_styles,founded,general_info,general_manager,genre,global_brand_page_name,global_brand_root_id,has_added_app,hometown,hours,impressum,influences,is_always_open,is_permanently_closed,is_published,is_unclaimed,is_verified,last_used_time,leadgen_tos_accepted,link,location,members,mission,mpg,name,name_with_location_descriptor,network,owner_business,parent_page,parking,payment_options,personal_info,personal_interests,pharma_safety_info,phone,place_type,plot_outline,press_contact,price_range,produced_by,products,public_transit,record_label,release_date,restaurant_services,restaurant_specialties,schedule,screenplay_by,season,single_line_address,starring,start_info,store_location_descriptor,store_number,studio,talking_about_count,username,verification_status,website,were_here_count,written_by';
                    break;
                case 'comment':
                    fieldRequest = '?fields=id,attachment,comment_count,created_time,from,like_count,message,message_tags,object,parent';
                    break;
                case 'group':
                    fieldRequest = '?fields=id,cover,description,email,icon,name,parent,privacy,updated_time';
                    break;
                default:
                    // code
            }
            var url = baseUrl + id + fieldRequest + '&access_token='+ token;
            
            fbService.requestFb(url).then((data)=>{
                data = JSON.parse(data);
                dbService.createNode('Post',data).then(
                    (succ)=>{
                        resolve(data);        
                    },(err)=>{
                        reject(err);
                    }
                    );
                
            },(err)=>{reject(err)});    
                                   
        },(fail)=>{
                fail = JSON.stringify(fail);
    
                if(fail.indexOf('getaddrinfo') > -1) {
                    reject({status:'error',message:'lost connection'});
                }
                else{
                    if(fail.indexOf('Session has expired') > -1) {
                        reject({status:'error','message':{token:token}});       
                    }
                    else{
                        console.log(fail);
                        reject(fail);
                    }
                } 
            });
    });
}

